import axios from 'axios';
import { $ } from './bling';
import { info } from 'sass';


const map_options = {

    center: { lat: 43.2, lng: -79.8 },
    zoom: 10

};


function load_places(map, lat = 43.2, lng = -79.8) {

    axios.get(`/api/stores/near?lat=${lat}&lng=${lng}`)
        .then(res => {
            const places = res.data;
            if (!places.length) {

                alert('no places found!');
                return;

            };

            // create bounds which zoom in but fit all markers
            const bounds = new google.maps.LatLngBounds();

            // create info pop-up
            const info_window = new google.maps.InfoWindow();

            const markers = places.map(place => {

                const [place_lng, place_lat] = place.location.coordinates;
                const position = { lat: place_lat, lng: place_lng };
                bounds.extend(position);
                const marker = new google.maps.Marker({ map, position });
                marker.place = place;
                return marker;
            });

            // add info window pop-ups for each marker
            markers.forEach(marker => marker.addListener('click', function () {


                const html = `
                <div class="popup">
                  <a href="/store/${this.place.slug}">
                    <img src="/uploads/${this.place.photo || 'store.png'}" alt="${this.place.name}" />
                    <p>${this.place.name} - ${this.place.location.address}</p>
                  </a>
                </div>    
                `;
                info_window.setContent(html);
                info_window.open(map, this);

            }

            ));


            // then zoom the map with the bounds
            map.setCenter(bounds.getCenter());
            map.fitBounds(bounds);

        });

};


function make_map(map_div) {

    if (!map_div) { return };

    const map = new google.maps.Map(map_div, map_options);
    load_places(map);

    const input = $('[name="geolocate"]');
    const auto_complete = new google.maps.places.Autocomplete(input);
    auto_complete.addListener('place_changed', () => {

        const place = auto_complete.getPlace();
        load_places(map, place.geometry.location.lat(), place.geometry.location.lng());

    });

};

export default make_map;