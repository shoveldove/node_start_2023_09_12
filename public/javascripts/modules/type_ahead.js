import axios from 'axios';
import dom_purify from 'dompurify';

function search_results_HTML(stores) {

    return stores.map(store => {

        return `
        <a href="/store/${store.slug}" class="search__result">
        <b>${store.name}</b>
        `;

    }).join('');

}

function type_ahead(search) {

    if (!search) return;

    const search_input = search.querySelector('input[name="search"]');
    const search_results = search.querySelector('.search__results');

    search_input.on('input', function () {

        // in the event that there's no search value, quit
        if (!this.value) {
            search_results.style.display = 'none';
            return; // stop!
        }

        // otherwise, show the search results
        search_results.style.display = 'block';

        axios
            .get(`/api/search?q=${this.value}`)
            .then(res => {

                if (res.data.length) {

                    search_results.innerHTML = dom_purify.sanitize(search_results_HTML(res.data));
                    return;

                }

                // else, inform user that nothing came back

                search_results.innerHTML = dom_purify.sanitize(`<div class="search__result">No search results for <b>${this.value}</b>.</div>`);

            }
            )
            .catch(err => {

                console.error(err);

            })

    });

    // handle keyboard inputs

    search_input.on('keyup', (e) => {

        // ignore if user is not pressing up, down or enter

        if (![38, 40, 13].includes(e.keyCode)) {

            return; // ignore

        }

        const active_class = 'search__result--active';
        const current = search.querySelector(`.${active_class}`);
        const items = search.querySelectorAll('.search__result');
        let next;

        if (e.keyCode === 40 && current) {

            next = current.nextElementSibling || items[0];

        } else if (e.keyCode === 40) {

            next = items[0];

        } else if (e.keyCode === 38 && current) {

            next = current.previousElementSibling || items[items.length - 1];

        } else if (e.keyCode === 38) {

            next = items[items.length - 1];

        } else if (e.keyCode === 13 && current.href) {

            window.location = current.href;
            return;

        };

        if (current) {

            current.classList.remove(active_class);

        }
        next.classList.add(active_class);

    });

};

export default type_ahead;