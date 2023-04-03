import React, { Component } from 'react';
import DotLoader from 'react-spinners/DotLoader';
import '../../css/Modal.css'
import { TEXT_SECONDARY_COLOR, BACKGROUND_COLOR, CTA_COLOR } from '../../actions/types'


class ModalLoading extends Component {
	render() {
		const { showModal, width, text } = this.props;

		const classContainer = showModal ? "containerPopup" : "hidePopup"

		return (
			<div className={classContainer}>
				<div style={Object.assign({}, styles.subcontainer, { width })}>

					<DotLoader size={25} color={TEXT_SECONDARY_COLOR} />

                    <p style={{ fontSize: 19, color: 'white', margin: 30 }}>
                        {text}
                    </p>
				</div>
			</div>
		)
	}
}


const styles = {
	subcontainer: {
		height: 200,
        minWidth: 250,
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
}

export default ModalLoading;
