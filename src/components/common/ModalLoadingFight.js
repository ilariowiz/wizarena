import React, { Component } from 'react';
import { connect } from 'react-redux'
import DotLoader from 'react-spinners/DotLoader';
import { IoClose } from 'react-icons/io5'
import { CTA_COLOR } from '../../actions/types'
import '../../css/Modal.css'



class ModalLoadingFight extends Component {
	render() {
		const { showModal, width, text, mainTextColor, mainBackgroundColor, fightId, onCloseModal } = this.props;

		const classContainer = showModal ? "containerPopup" : "hidePopup"

		return (
			<div className={classContainer}>
				<div style={Object.assign({}, styles.subcontainer, { width, backgroundColor: mainBackgroundColor })}>

					{
						!fightId &&
						<DotLoader size={25} color={mainTextColor} />
					}

                    <p style={{ fontSize: 17, color: mainTextColor, margin: 30 }}>
                        {text}
                    </p>

					{
						fightId &&
						<a
			                href={`${window.location.protocol}//${window.location.host}/fightreplay/fights_pvp2/${fightId}`}
			                target="_blank"
			                rel="noopener noreferrer"
			                className='btnH'
			                style={Object.assign({}, styles.btnConnect, { marginBottom: 10 })}
			            >
                            <p style={{ color: 'white', fontSize: 17 }} className="text-medium">
                                Replay
                            </p>
						</a>
					}

					{
						fightId &&
						<button
							style={{ position: 'absolute', right: 15, top: 15 }}
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
		height: 200,
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
		width: 200,
		height: 40,
		backgroundColor: CTA_COLOR,
		borderRadius: 4,
		justifyContent: 'center',
		alignItems: 'center',
		display: "flex"
	},
}

const mapStateToProps = (state) => {
	const { mainTextColor, mainBackgroundColor } = state.mainReducer

	return { mainTextColor, mainBackgroundColor }
}

export default connect(mapStateToProps)(ModalLoadingFight);
