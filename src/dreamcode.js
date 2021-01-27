module.exports.box = ({ setup, domElement }) => {
  //--BEGIN---

  setup(({ context, box, boxes }) => {
    context.set("video", {
      text: "a 123, b 123, c 123 ",
    });

    context.get("video").then((e) => {
      domElement.innerHTML = e.text + JSON.stringify(boxes);
    });
  });

  //--END---

  return {
    name: "app",
  };
};
