import '../sass/style.scss';

import { $, $$ } from './modules/bling';

import auto_complete from './modules/auto_complete';
import type_ahead from './modules/type_ahead';
import make_map from './modules/map';
import ajax_heart from './modules/heart';


auto_complete($('#address'), $('#lat'), $('#lng'));

type_ahead($('.search'));

make_map($('#map'));

const heart_forms = $$('form.heart');

heart_forms.on('submit', ajax_heart);
