const Contact = require('../models/contact');

const findContactById = async (id) => {
  try {
    const contact = await Contact.findById(id);

    if (!contact) {
      throw new Error('No Contact Found');
    }

    return contact;
  } catch (error) {
    throw error; // Re-throw the error to be handled higher up the call stack
  }
};

const getContacts = async () => {
  try {
    const contacts = await Contact.find();
    return contacts;
  } catch (err) {
    throw err;
  }
};

const saveContact = async (contact) => {
  try {
    await contact.save();
  } catch (err) {
    throw new Error('Something Went Wrong');
  }
};

const updateContact = async (id, newContact) => {
  try {
    const contact = await Contact.findOneAndUpdate({ _id: id }, newContact, {
      new: true,
    });
    if (!contact) {
      throw new Error('Contact not found');
    }

    return contact;
  } catch (err) {
    throw err;
  }
};

const deleteContact = async (id) => {
  try {
    const res = await Contact.findByIdAndDelete(id);
    if (!res) {
      throw new Error('Contact Not Found');
    }
    return res;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  updateContact,
  getContacts,
  findContactById,
  saveContact,
  deleteContact,
};
