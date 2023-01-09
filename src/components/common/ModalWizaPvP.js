import React, { Component } from 'react';
import { IoClose } from 'react-icons/io5'
import '../../css/Modal.css'
import { TEXT_SECONDARY_COLOR, BACKGROUND_COLOR, CTA_COLOR } from '../../actions/types'


class ModalWizaPvP extends Component {
    constructor(props) {
		super(props)

		this.state = {
			wizaAmount: '',
		}
	}

    subscribe() {
        const { wizaAmount } = this.state
        const { wizaBalance } = this.props

        if (!wizaAmount || !wizaBalance) {
            return
        }

        if (wizaAmount > wizaBalance) {
            return
        }

        this.props.callback(wizaAmount)
    }

	render() {
		const { showModal, onCloseModal, width } = this.props;

		const classContainer = showModal ? "containerPopup" : "hidePopup"

		return (
			<div className={classContainer}>
				<div style={Object.assign({}, styles.subcontainer, { width })}>

					<div style={styles.boxWallet}>
                        <p style={{ color: 'white', fontSize: 20, marginBottom: 15, textAlign: 'center', marginTop: 10 }}>
                            How many fights do you want to do?
                        </p>

                        <p style={{ color: 'white', fontSize: 18, marginBottom: 5, textAlign: 'center' }}>
                            1 WIZA = 1 fights
                        </p>

                        <p style={{ color: 'white', fontSize: 16, marginBottom: 15, textAlign: 'center' }}>
                            (min 30 WIZA)
                        </p>

                        <p style={{ color: 'white', fontSize: 18, marginBottom: 15, textAlign: 'center' }}>
                            at the end of the week you will receive 2 WIZA for each win
                        </p>

                        <p style={{ color: 'white', fontSize: 18, marginBottom: 10, textAlign: 'center' }}>
                            WIZA balance: {this.props.wizaBalance}
                        </p>

                        <input
                            style={styles.input}
                            type='text'
                            placeholder='WIZA amount'
                            value={this.state.wizaAmount}
                            onChange={(e) => this.setState({ wizaAmount: e.target.value })}
                        />

                        <button
                            className='btnH'
                            style={styles.btnConnect}
                            onClick={() => this.subscribe()}
                        >
                            <p style={{ color: 'white', fontSize: 19 }}>
                                SUBSCRIBE
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
	},
    boxWallet: {
		flexDirection: 'column',
		backgroundColor: 'transparent',
		padding: 20,
		alignItems: 'center',
	},
	input: {
		width: 240,
		height: 45,
		borderWidth: 1,
		borderColor: 'lightgrey',
		borderStyle: 'solid',
		borderRadius: 2,
		fontSize: 16,
		color: 'black',
		paddingLeft: 16,
		paddingRight: 16,
		marginBottom: 30,
		marginTop: 15,
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
        marginBottom: 10
	},
}

export default ModalWizaPvP;
