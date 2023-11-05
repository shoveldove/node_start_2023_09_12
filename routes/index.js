const express = require('express');
const router = express.Router();
const controller_001_store = require('../controllers/controller_001_store');
const controller_002_user = require('../controllers/controller_002_user');
const controller_003_auth = require('../controllers/controller_003_auth');
const controller_004_review = require('../controllers/controller_004_review');


const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/',
  controller_001_store.store_middleware_001,
  catchErrors(controller_001_store.get_stores)
);

router.get('/stores',
  catchErrors(controller_001_store.get_stores)
);

router.get('/stores/page/:page',
  catchErrors(controller_001_store.get_stores)
)

router.get('/add_store',
  controller_003_auth.is_logged_in,
  controller_001_store.add_store
);

router.post('/add_store',
  controller_001_store.upload_photo,
  catchErrors(controller_001_store.resize),
  catchErrors(controller_001_store.create_store)
);

router.post('/add_store/:id',
  controller_001_store.upload_photo,
  catchErrors(controller_001_store.resize),
  catchErrors(controller_001_store.update_store)
);


router.get('/reverse/:nname', (req, res) => {
  const rreverse = [...req.params.nname
  ].reverse().join('');
  res.send(rreverse)
})

router.get('/stores/:id/edit',
  catchErrors(controller_001_store.edit_store)
);

router.get('/store/:slug',
  catchErrors(controller_001_store.get_store_by_slug)
);

router.get('/tags',
  catchErrors(controller_001_store.get_stores_by_tag)
)

router.get('/tags/:tag',
  catchErrors(controller_001_store.get_stores_by_tag)
)

router.get('/login',
  controller_002_user.login_form
)

router.post('/login',
  controller_003_auth.login_user
);

router.get('/register',
  controller_002_user.register_form
);

// 1. Validate the registration
// 2. Register the user
// 3. Log user in
router.post('/register',

  controller_002_user.validate_registration,
  controller_002_user.register,
  controller_003_auth.login_user

);

router.get('/logout',
  controller_003_auth.logout_user
);

router.get('/account',

  controller_003_auth.is_logged_in,
  controller_002_user.account_page

);

router.post('/account',

  catchErrors(controller_002_user.update_account)

);

router.post('/account/forgot',

  catchErrors(controller_003_auth.forgot_password)

);

router.get('/account/reset/:token',

  catchErrors(controller_003_auth.reset_password)

);

router.post('/account/reset/:token',

  controller_003_auth.confirm_password,
  catchErrors(controller_003_auth.update_password)

);

router.get('/map', controller_001_store.map_page);

router.get('/loved_stores',

  controller_003_auth.is_logged_in,
  catchErrors(controller_001_store.get_hearted_stores)

);


router.post('/reviews/:id',

  controller_003_auth.is_logged_in,
  catchErrors(controller_004_review.add_review)

);

router.get('/top',

  catchErrors(controller_001_store.get_top_stores)

);

/* 
API
*/

router.get('/api/search',

  catchErrors(controller_001_store.search_stores)

);

router.get('/api/stores/near',

  catchErrors(controller_001_store.map_stores)

);

router.post('/api/stores/:id/heart',

  catchErrors(controller_001_store.heart_store)

);


module.exports = router;