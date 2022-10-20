import React, { Component } from 'react';
import { IoClose } from 'react-icons/io5'
import '../../css/Modal.css'
import { TEXT_SECONDARY_COLOR, BACKGROUND_COLOR, CTA_COLOR } from '../../actions/types'


class ModalTransfer extends Component {
    constructor(props) {
		super(props)

		this.state = {
			address: '',
		}
	}

    startTransfer() {
        const { address } = this.state
        if (!address) {
            return
        }

        this.props.callback(address)
    }

	render() {
		const { showModal, onCloseModal, width } = this.props;

		const classContainer = showModal ? "containerPopup" : "hidePopup"

		return (
			<div className={classContainer}>
				<div style={Object.assign({}, styles.subcontainer, { width })}>

					<p style={{ color: 'white', fontSize: 18 }}>
						Paste the k: wallet of the receiver
					</p>

					<div style={styles.boxWallet}>
                        <input
                            style={styles.input}
                            type='text'
                            placeholder='Kadena address'
                            value={this.state.address}
                            onChange={(e) => this.setState({ address: e.target.value })}
                        />

                        <button
                            className='btnH'
                            style={styles.btnConnect}
                            onClick={() => this.startTransfer()}
                        >
                            <p style={{ color: 'white', fontSize: 19 }}>
                                Transfer
                            </p>
                        </button>

                    </div>

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
    boxWallet: {
		flexDirection: 'column',
		backgroundColor: 'transparent',
		paddingLeft: 12,
		paddingRight: 12,
		alignItems: 'center',
	},
	input: {
		width: 240,
		height: 45,
		borderWidth: 1,
		borderColor: 'lightgrey',
		borderStyle: 'solid',
		borderRadius: 2,
		fontSize: 14,
		color: 'black',
		paddingLeft: 16,
		paddingRight: 16,
		marginBottom: 30,
		marginTop: 30,
		WebkitAppearance: 'none',
		MozAppearance: 'none',
		appearance: 'none',
		outline: 'none'
	},
	btnConnect: {
		width: 272,
		height: 45,
		backgroundColor: CTA_COLOR,
		borderRadius: 2,
	},
}

export default ModalTransfer;
