export const setViewHeight = (): void => {
  console.log(document.documentElement.clientHeight);
  const body: HTMLBodyElement | null = document.querySelector("body");
  if (body) {
    body.style.height = document.documentElement.clientHeight + "px";
  }
};
