import React, { Component } from 'react';
import ConnectionWidget from './ConnectionWidget'
import { IoClose } from 'react-icons/io5'
import '../../css/Modal.css'
import { TEXT_SECONDARY_COLOR, BACKGROUND_COLOR } from '../../actions/types'


class ModalConnectionWidget extends Component {
	render() {
		const { showModal, onCloseModal, width } = this.props;

		const classContainer = showModal ? "containerPopup" : "hidePopup"

		return (
			<div className={classContainer}>
				<div style={Object.assign({}, styles.subcontainer, { width })}>

					<ConnectionWidget
						callback={onCloseModal}
					/>

					<button
						style={{ position: 'absolute', right: 15, top: 15 }}
						onClick={onCloseModal}
					>
						<IoClose
							color='white'
							size={25}
						/>
					</button>

				</div>
			</div>
		)
	}
}


const styles = {
	subcontainer: {
		minHeight: 300,
		backgroundColor: BACKGROUND_COLOR,
		borderRadius: 2,
		borderColor: TEXT_SECONDARY_COLOR,
		borderStyle: 'solid',
		borderWidth: 2,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column',
		position: 'relative'
	}
}

export default ModalConnectionWidget;
