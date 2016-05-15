function inputElementUnits() {
  return {
    restrict: "E",
    scope: {
      className: "@",
      spanText: "@",
      inputName: "@",
      inputId: "@",
      inputClass: "@",
      placeholder: "@",
      initValue: "@",
      pattern: "@",
      units: "@"
    },
    templateUrl: "directives/inputElementUnits/inputElementUnits.tpl.html",
    transclude: true
  }
}
