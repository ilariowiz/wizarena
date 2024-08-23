import React, { Component } from 'react';
import { connect } from 'react-redux'
import DotLoader from 'react-spinners/DotLoader';
import '../../css/Modal.css'


class ModalEndEndurance extends Component {
	render() {
		const { showModal, width, text, mainTextColor, mainBackgroundColor } = this.props;

		const classContainer = showModal ? "containerPopup bgEndurance" : "hidePopup"

		return (
			<div className={classContainer}>
				<div style={Object.assign({}, styles.subcontainer, { width, backgroundColor: mainBackgroundColor })}>

                    <p style={{ fontSize: 19, color: mainTextColor, margin: 30 }}>
                        {text}
                    </p>

					<a
		                style={styles.btnDone}
						href={`${window.location.protocol}//${window.location.host}/dungeons`}
		            >
		                <p style={{ fontSize: 15, color: mainTextColor }} className="text-medium">
		                    Done
		                </p>
		            </a>

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
	btnDone: {
        borderRadius: 4,
        width: 150,
        height: 40,
        cursor: 'pointer',
        borderColor: "#d7d7d7",
        borderWidth: 1,
        borderStyle: 'solid',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
		backgroundColor: "#4e0000"
    }
}

const mapStateToProps = (state) => {
	const { mainTextColor, mainBackgroundColor } = state.mainReducer

	return { mainTextColor, mainBackgroundColor }
}

export default connect(mapStateToProps)(ModalEndEndurance);
