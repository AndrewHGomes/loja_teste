export function capturar(seletor, todos = false) {
  if (todos) {
    return document.querySelectorAll(seletor);
  }
  return document.querySelector(seletor);
}
