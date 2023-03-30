const getBoxWidth = (isMobile) => {

	const headerW = document.getElementById("headerbox") ? document.getElementById("headerbox").offsetWidth : 0
	//console.log(headerW);

	const padding = isMobile ? 30 : 56
	let boxW = Math.floor(window.innerWidth - headerW - padding)

	//console.log(isMobile, window.innerWidth, boxW);

	let modalW = Math.floor(boxW * 80 / 100)
	if (modalW > 500) modalW = 500
	if (modalW < 310) modalW = 310

	return { boxW, modalW }
}

export default getBoxWidth
