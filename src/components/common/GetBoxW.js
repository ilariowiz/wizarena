const getBoxWidth = (isMobile) => {

	//const headerW = document.getElementById("headerbox") ? document.getElementById("headerbox").offsetWidth : 0
	//console.log(headerW);

	const innerW = window.innerWidth

	const padding = (innerW * 12 / 100) / 2
	//let boxW = Math.floor(window.innerWidth - headerW - padding)
	let boxW = Math.floor(innerW - (padding * 2))

	//console.log(isMobile, window.innerWidth, boxW);

	let modalW = Math.floor(boxW * 80 / 100)
	if (modalW > 500) modalW = 500
	if (modalW < 310) modalW = 310

	return { boxW, modalW, padding }
}

export default getBoxWidth
