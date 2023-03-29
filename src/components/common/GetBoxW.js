const getBoxWidth = (isMobile) => {

	const headerW = document.getElementById("headerbox") ? document.getElementById("headerbox").offsetWidth : 205
	//console.log(headerW);

	/*
	//let boxW = Math.floor((window.innerWidth * 90 / 100) - 206)
	let boxW = Math.floor(window.innerWidth - 256)

	if (isMobile) {
		//boxW = Math.floor((window.innerWidth * 90 / 100) - 80)
		boxW = Math.floor(window.innerWidth - 112)
	}
	*/

	const padding = isMobile ? 32 : 52
	let boxW = Math.floor(window.innerWidth - headerW - padding)

	//console.log(isMobile, window.innerWidth, boxW);

	let modalW = Math.floor(boxW * 80 / 100)
	if (modalW > 500) modalW = 500
	if (modalW < 310) modalW = 310

	return { boxW, modalW }
}

export default getBoxWidth
