function inputElement() {
  return {
    restrict: "E",
    scope: {
      className: "@",
      spanText: "@",
      inputName: "@",
      inputClass: "@",
      placeholder: "@",
      pattern: "@"
    },
    templateUrl: "directives/inputElement/inputElement.tpl.html",
    transclude: true
  }
}
