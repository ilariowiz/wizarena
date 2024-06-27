import React, { Component } from 'react';
import { connect } from 'react-redux'
import DotLoader from 'react-spinners/DotLoader';
import getImageUrl from './GetImageUrl'
import { IoClose } from 'react-icons/io5'
import { CTA_COLOR } from '../../actions/types'
import '../../css/Modal.css'



class ModalLoadingFight extends Component {
	render() {
		const { showModal, width, text, mainTextColor, mainBackgroundColor, fightId, onCloseModal, refdb, opponentId, wizardSelectedId, isMobile } = this.props;

		const classContainer = showModal ? "containerPopup" : "hidePopup"

		const imgSize = isMobile ? (width - 70) / 2 : 190

		return (
			<div className={classContainer}>
				<div style={Object.assign({}, styles.subcontainer, { width, backgroundColor: mainBackgroundColor })}>

					<div style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 15 }}>

						{
							wizardSelectedId &&
							<img
	                            style={{ width: imgSize, height: imgSize, borderRadius: 4 }}
	                            src={getImageUrl(wizardSelectedId)}
	                            alt={`#${wizardSelectedId}`}
	                        />
						}

						<p style={{ fontSize: 18, color: mainTextColor, textAlign: 'center', marginRight: 10, marginLeft: 10 }} className="text-bold">
							VS
						</p>

						{
							opponentId ?
							<img
	                            style={{ width: imgSize, height: imgSize, borderRadius: 4 }}
	                            src={getImageUrl(opponentId)}
	                            alt={`#${opponentId}`}
	                        />
							:
							<img
	                            style={{ width: imgSize, height: imgSize, borderRadius: 4 }}
	                            src={getImageUrl(undefined)}
								alt="placeholder"
	                        />
						}

					</div>

					{
						!fightId &&
						<DotLoader size={25} color={mainTextColor} />
					}

                    <p style={{ fontSize: 17, color: mainTextColor, margin: 20 }}>
                        {text}
                    </p>

					{
						fightId &&
						<a
			                href={`${window.location.protocol}//${window.location.host}/fightreplay/${refdb}/${fightId}`}
			                target="_blank"
			                rel="noopener noreferrer"
			                className='btnH'
			                style={styles.btnConnect}
			            >
                            <p style={{ color: 'white', fontSize: 17 }} className="text-medium">
                                Replay
                            </p>
						</a>
					}

					{
						fightId &&
						<button
							style={{ position: 'absolute', right: 4, top: 4 }}
							onClick={onCloseModal}
						>
							<IoClose
								color={mainTextColor}
								size={25}
							/>
						</button>
					}
				</div>
			</div>
		)
	}
}


const styles = {
	subcontainer: {
		minHeight: 300,
        minWidth: 250,
		borderRadius: 4,
		borderColor: "#d7d7d7",
		borderStyle: 'solid',
		borderWidth: 1,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column',
		position: 'relative'
	},
	btnConnect: {
		width: 160,
		height: 40,
		backgroundColor: CTA_COLOR,
		borderRadius: 4,
		justifyContent: 'center',
		alignItems: 'center',
		display: "flex",
		marginBottom: 15
	},
}

const mapStateToProps = (state) => {
	const { mainTextColor, mainBackgroundColor } = state.mainReducer

	return { mainTextColor, mainBackgroundColor }
}

export default connect(mapStateToProps)(ModalLoadingFight);
