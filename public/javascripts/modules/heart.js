import axios from 'axios';
import { $ } from './bling';

function ajax_heart(e) {

    e.preventDefault();
    //console.log('Don\'t go breaking my shart.');
    //console.log(this);
    axios
        .post(this.action)
        .then(res => {

            const is_hearted = this.heart.classList.toggle('heart__button--hearted');

            $('.heart-count').textContent = res.data.hearts.length;
            if (is_hearted) {

                this.heart.classList.add('heart__button--float');
                setTimeout(() => this.heart.classList.remove('heart__button--float'), 2500);

            }

        })
        .catch(console.error)

}

export default ajax_heart;