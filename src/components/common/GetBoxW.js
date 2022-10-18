const getBoxWidth = (isMobile) => {
	let boxW = Math.floor(window.innerWidth * 90 / 100)
	//if (boxW > 1200) boxW = 1200;

	if (isMobile) {
		boxW = Math.floor(window.innerWidth * 90 / 100)
	}

	let modalW = Math.floor(boxW * 80 / 100)
	if (modalW > 500) modalW = 500
	if (modalW < 310) modalW = 310

	return { boxW, modalW }
}

export default getBoxWidth
