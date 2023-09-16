const {
  getContactById,
  createContact,
  getAllContacts,
  updateContactById,
  deleteContactById,
  exportContactsToCSV,
} = require('../controllers/contact.controller');

const router = require('express').Router;

const contactRouter = router();

contactRouter.get('/export', exportContactsToCSV);

contactRouter.get('/', getAllContacts);
contactRouter.get('/:id', getContactById);

contactRouter.post('/', createContact);
contactRouter.put('/:id', updateContactById);

contactRouter.delete('/:id', deleteContactById);

module.exports = contactRouter;
