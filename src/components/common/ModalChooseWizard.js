import React, { Component } from 'react';
import { connect } from 'react-redux'
import { IoClose } from 'react-icons/io5'
import NftCardChoiceFlashT from './NftCardChoiceFlashT'
import '../../css/Modal.css'
import { TEXT_SECONDARY_COLOR } from '../../actions/types'


class ModalChooseWizard extends Component {
	render() {
		const { showModal, onCloseModal, width, yourWizards, equipment, mainTextColor, mainBackgroundColor } = this.props;

		const classContainer = showModal ? "containerPopup" : "hidePopup"

		return (
			<div className={classContainer}>
				<div style={Object.assign({}, styles.subcontainer, { width: '90%', backgroundColor: mainBackgroundColor })}>

					<div style={{ flexWrap: 'wrap', overflowY: 'auto', overflowX: 'hidden', justifyContent: 'center', marginTop: 30 }}>
						{yourWizards && yourWizards.map((item, index) => {
							return (
								<NftCardChoiceFlashT
									key={index}
									item={item}
									equipment={equipment}
									onSelect={(id) => {
										this.props.onSelect(id)
									}}
									width={230}
								/>
							)
						})}
					</div>

					<button
						style={{ position: 'absolute', right: 15, top: 15 }}
						onClick={onCloseModal}
					>
						<IoClose
							color={mainTextColor}
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
		borderRadius: 4,
		borderColor: "#d7d7d7",
		borderStyle: 'solid',
		borderWidth: 1,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column',
		position: 'relative',
		maxHeight: '90%'
	}
}

const mapStateToProps = (state) => {
	const { mainTextColor, mainBackgroundColor } = state.mainReducer

	return { mainTextColor, mainBackgroundColor }
}

export default connect(mapStateToProps)(ModalChooseWizard);
