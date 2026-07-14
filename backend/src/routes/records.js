const router = require('express').Router();
const ctrl   = require('../controllers/recordsController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.use(requireAuth);

router.post('/',          ctrl.create);
router.delete('/:id',     ctrl.remove);
router.get('/today',      ctrl.today);
router.get('/',           requireAdmin, ctrl.list);
router.get('/summary',    requireAdmin, ctrl.summary);

module.exports = router;
