//

module.exports = ({ effect }) => {
  effect(async ({ context, loop, inputs, output, box, state }) => {
    let camera = await context.get("camera");

    let iiA = inputs("A");
    let ooB = output("B");

    let myService = {
      playVideo: () => {
        console.log("play video");
      },
    };

    loop(() => {});

    iiA.onData((data) => {
      ooB.sendData(data);
    });

    context.set("videoPlayer", myService);
    return () => {
      // cleanup
    };
  });
};
