const Contact = require('../models/contact');
const {
  getContacts,
  findContactById,
  saveContact,
  updateContact,
  deleteContact,
} = require('../services/contact.service');
const redisClient = require('../redisClient');
const path = require('path');
const { createObjectCsvWriter } = require('csv-writer');

const getAllContacts = async (req, res) => {
  const cachedKey = 'allContacts';
  try {
    // try to retrieve from redis
    const cachedData = await redisClient.get(cachedKey);
    if (cachedData) {
      // If data is found in the cache, parse and return it
      const contacts = JSON.parse(cachedData);
      return res.status(200).json({ allContacts: contacts });
    } else {
      const contacts = await getContacts();
      // cahche data if not available
      await redisClient.setex(cachedKey, 3600, JSON.stringify(contacts));
      return res.status(200).json({ allContacts: contacts });
    }
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
};

const getContactById = async (req, res) => {
  const contactId = req.params.id;
  const cacheKey = `contact:${contactId}`;

  try {
    // Attempt to retrieve the contact data from the cache
    const cachedContact = await redisClient.get(cacheKey);

    if (cachedContact) {
      // If data is found in the cache, parse and return it
      const contact = JSON.parse(cachedContact);
      return res.status(200).json({ contact: contact });
    } else {
      // If data is not in the cache, fetch it from the data source
      const contact = await findContactById(contactId);

      if (!contact) {
        return res.status(404).json({ message: 'Contact not found' });
      }

      // Store the fetched contact data in the cache with an expiration time (e.g., 1 hour)
      await redisClient.setex(cacheKey, 3600, JSON.stringify(contact));

      return res.status(200).json({ contact: contact });
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const createContact = async (req, res) => {
  const newContactInfo = req.body;
  try {
    const contact = new Contact(newContactInfo);
    await saveContact(contact);

    // Fetch the updated list of all contacts from the database
    const updatedAllContacts = await getContacts();

    // Store the updated list in the Redis cache
    await redisClient.set('allContacts', JSON.stringify(updatedAllContacts));

    res.status(201).json({ message: 'Contact Created' });
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const updateContactById = async (req, res) => {
  const id = req.params.id;
  const updatedContactInfo = req.body;

  try {
    const updatedContact = await updateContact(id, updatedContactInfo);

    if (!updatedContact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Fetch the updated contact details from the database
    const updatedContactDetails = await findContactById(id);

    // Store the updated contact details in the Redis cache, replacing the previous cached data
    await redisClient.set(
      `contact:${id}`,
      JSON.stringify(updatedContactDetails)
    );

    res
      .status(200)
      .json({ message: 'Contact Updated', contact: updatedContact });
  } catch (err) {
    res.status(500).send(err.message);
  }
};

const deleteContactById = async (req, res) => {
  const contactId = req.params.id;
  const cacheKey = `contact:${contactId}`;
  const allContactsCacheKey = 'allContacts';

  try {
    const deletedContact = await deleteContact(contactId);

    if (!deletedContact) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    // Fetch the current list of all contacts from the cache
    const allContacts = await redisClient.get(allContactsCacheKey);

    if (allContacts) {
      // Parse the cached data and remove the deleted contact from the list
      const parsedContacts = JSON.parse(allContacts);
      const updatedContacts = parsedContacts.filter(
        (contact) => contact._id !== contactId
      );

      // Update the cached list of all contacts
      await redisClient.set(
        allContactsCacheKey,
        JSON.stringify(updatedContacts)
      );
    }

    // Remove the cached data for the deleted contact
    await redisClient.del(cacheKey);

    res
      .status(200)
      .json({ message: 'Contact Deleted', contact: deletedContact });
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
};

// export to csv
const exportContactsToCSV = async (req, res) => {
  try {
    // Fetch all contacts from the database
    const contacts = await getContacts();

    if (contacts.length === 0) {
      return res.status(404).json({ message: 'No contacts found' });
    }

    console.log('inside export functoin');
    // Define the CSV file path and create a writable stream
    const csvFilePath = path.join(__dirname, '..', 'contacts.csv');
    const csvWriter = createObjectCsvWriter({
      path: csvFilePath,
      header: [
        { id: 'ContactName', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'phone', title: 'Contact Number' },
      ],
    });
    console.log('save file at ', csvFilePath);

    // Write the contacts to the CSV file
    await csvWriter.writeRecords(contacts);

    // Stream the CSV file as a response for download
    const file = fs.creatWriteStream(csvFilePath);
    res.setHeader('Content-Disposition', 'attachment; filename=contacts.csv');
    res.setHeader('Content-Type', 'text/csv');
    res.pipe(file);

    // Delete the temporary CSV file after streaming
    // fs.unlinkSync(csvFilePath);
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
};

module.exports = {
  deleteContactById,
  updateContactById,
  getAllContacts,
  getContactById,
  createContact,
  exportContactsToCSV,
};
