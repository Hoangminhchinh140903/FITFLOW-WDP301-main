const express = require('express');
const router = express.Router();
const returnPolicyController = require('../controllers/return-policy.controller');
const { requireAuth, authorize, requireOwner } = require('../middleware/auth.middleware');

router.get('/', requireAuth, authorize('owner', 'staff'), returnPolicyController.listPolicies);
router.get('/:id', requireAuth, authorize('owner', 'staff'), returnPolicyController.getPolicy);

// Chỉ owner mới CRUD
router.post('/', requireAuth, requireOwner, returnPolicyController.createPolicy);
router.put('/:id', requireAuth, requireOwner, returnPolicyController.updatePolicy);
router.delete('/:id', requireAuth, requireOwner, returnPolicyController.deletePolicy);

module.exports = router;
