import React, { Component } from 'react';
import { connect } from 'react-redux'
import DotLoader from 'react-spinners/DotLoader';
import '../../css/Modal.css'


class ModalLoading extends Component {
	render() {
		const { showModal, width, text, mainTextColor, mainBackgroundColor } = this.props;

		const classContainer = showModal ? "containerPopup" : "hidePopup"

		return (
			<div className={classContainer}>
				<div style={Object.assign({}, styles.subcontainer, { width, backgroundColor: mainBackgroundColor })}>

					<DotLoader size={25} color={mainTextColor} />

                    <p style={{ fontSize: 16, color: mainTextColor, margin: 30 }}>
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
		borderRadius: 4,
		borderColor: "#d7d7d7",
		borderStyle: 'solid',
		borderWidth: 1,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column',
		position: 'relative'
	},
}

const mapStateToProps = (state) => {
	const { mainTextColor, mainBackgroundColor } = state.mainReducer

	return { mainTextColor, mainBackgroundColor }
}

export default connect(mapStateToProps)(ModalLoading);
