// Ultra-simple loader hide test
window.addEventListener('load', function() {
  setTimeout(function() {
    var loader = document.getElementById('loader');
    if (loader) {
      loader.style.opacity = '0';
      loader.style.visibility = 'hidden';
    }
  }, 500);
});
