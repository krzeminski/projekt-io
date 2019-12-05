$('input[name="maxPrice"]').on('keydown keyup', function(e){
    if ($(this).val() < $('input[name="minPrice"]')
        && e.keyCode !==  // keycode for tab
        && e.keyCode !==  // keycode for enter
       ) {
       e.preventDefault();
       $(this).val($('input[name="minPrice"]'));
    }
});
