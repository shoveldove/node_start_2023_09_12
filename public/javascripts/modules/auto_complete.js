function auto_complete(input, lat_input, lon_input) {

    if (!input) return;// skip if no input from page 

    const dropdown = new google.maps.places.Autocomplete(input)

    dropdown.addListener('place_changed', () => {

        const place = dropdown.getPlace();
        lat_input.value = place.geometry.location.lat();
        lon_input.value = place.geometry.location.lng();

    });

    // if user hits enter key in any of the fields (speficially the auto-completed address field),
    // dont submit the entire form
    input.on('keydown', (e) => {

        if(e.keyCode === 13) e.preventDefault();

    })

}

export default auto_complete;