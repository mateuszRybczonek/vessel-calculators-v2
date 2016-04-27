$(window).scroll(function() {
  updateSidebarHeight();
});

function updateSidebarHeight() {
  var documentHeight = $(document).height();
  $('#sidebar-wrapper').each(function () {
    $(this).css('height', documentHeight);
  });
}