import React, { Component } from 'react';
import '../../css/Modal.css'
import { TEXT_SECONDARY_COLOR, BACKGROUND_COLOR, CTA_COLOR } from '../../actions/types'


class ModalPvPWinner extends Component {
	render() {
		const { showModal, width, winner } = this.props;

		const classContainer = showModal ? "containerPopup" : "hidePopup"

		return (
			<div className={classContainer}>
				<div style={Object.assign({}, styles.subcontainer, { width })}>

					<p style={{ color: 'white', fontSize: 22, marginBottom: 30 }}>
						The Winner is:
					</p>

                    <p style={{ fontSize: 28, color: 'white', marginBottom: 30 }}>
                        {winner}
                    </p>

                    <button
                        className='btnH'
                        style={styles.btnConnect}
                        onClick={() => this.props.history.replace("/pvp")}
                    >
                        <p style={{ color: 'white', fontSize: 18 }}>
                            Back to PvP
                        </p>
                    </button>

				</div>
			</div>
		)
	}
}


const styles = {
	subcontainer: {
		height: 300,
		backgroundColor: BACKGROUND_COLOR,
		borderRadius: 2,
		borderColor: TEXT_SECONDARY_COLOR,
		borderStyle: 'solid',
		borderWidth: 2,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column',
		position: 'relative'
	},
	btnConnect: {
		width: 272,
		height: 45,
		backgroundColor: CTA_COLOR,
		borderRadius: 2,
	},
}

export default ModalPvPWinner;
