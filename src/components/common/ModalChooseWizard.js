import React, { Component } from 'react';
import { connect } from 'react-redux'
import { IoClose } from 'react-icons/io5'
import NftCardChoice from './NftCardChoice'
import '../../css/Modal.css'


class ModalChooseWizard extends Component {
	render() {
		const { showModal, onCloseModal, yourWizards, mainTextColor, mainBackgroundColor } = this.props;

		const classContainer = showModal ? "containerPopup" : "hidePopup"

		return (
			<div className={classContainer}>
				<div style={Object.assign({}, styles.subcontainer, { width: '90%', backgroundColor: mainBackgroundColor })}>

					<div style={{ flexWrap: 'wrap', overflowY: 'auto', overflowX: 'hidden', justifyContent: 'center', marginTop: 30 }}>
						{yourWizards && yourWizards.map((item, index) => {
							return (
								<NftCardChoice
									key={index}
									item={item}
									width={230}
									onSubscribe={(id) => this.props.onSelect(id)}
									modalWidth={230}
									section={"flash"}
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
