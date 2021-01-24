

module.exports = ({ globals, createEffect }) => {
  let camera = await globals.get('camera')

  createEffect(async ({ loop, inputs, output }) => {
    let inputA = inputs('A')
    let outputB = output('B')

    loop(() => {

    })

    inputA.onData((data) => {
      outputB.sendData(data)
    })
  })
}
