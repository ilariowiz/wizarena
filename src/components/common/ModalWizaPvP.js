import React, { Component } from 'react';
import { connect } from 'react-redux'
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

    onlyNumbers(str) {
		return /^[0-9]+$/.test(str);
	}

    subscribe() {
        const { wizaAmount } = this.state
        const { wizaBalance } = this.props

        //console.log(wizaAmount);

        if (parseInt(wizaAmount) === 0) {
            return
        }

        if (!wizaAmount || !wizaBalance || !this.onlyNumbers(wizaAmount)) {
            return
        }

        if (wizaAmount > wizaBalance) {
            return
        }

        this.props.callback(parseInt(wizaAmount))
    }

	render() {
		const { showModal, onCloseModal, width, mainTextColor } = this.props;

		const classContainer = showModal ? "containerPopup" : "hidePopup"

		return (
			<div className={classContainer}>
				<div style={Object.assign({}, styles.subcontainer, { width })}>

					<div style={styles.boxWallet}>
                        <p style={{ color: mainTextColor, fontSize: 18, marginBottom: 15, textAlign: 'center', marginTop: 10 }}>
                            How many fights do you want to do?
                        </p>

                        <p style={{ color: mainTextColor, fontSize: 16, marginBottom: 5, textAlign: 'center' }} className="text-medium">
                            1 WIZA = 1 fights
                        </p>

                        <p style={{ color: mainTextColor, fontSize: 14, marginBottom: 15, textAlign: 'center' }}>
                            (min 30 WIZA)
                        </p>

                        <p style={{ color: mainTextColor, fontSize: 16, marginBottom: 15, textAlign: 'center' }}>
                            At the end of the week you will receive 2 WIZA for each win
                        </p>

                        <p style={{ color: mainTextColor, fontSize: 14, marginBottom: 10, textAlign: 'center' }} className="text-bold">
                            $WIZA balance: {this.props.wizaBalance}
                        </p>

                        <input
                            style={styles.input}
                            type='text'
                            placeholder='$WIZA amount'
                            value={this.state.wizaAmount}
                            onChange={(e) => this.setState({ wizaAmount: e.target.value })}
                        />

                        <button
                            className='btnH'
                            style={styles.btnConnect}
                            onClick={() => this.subscribe()}
                        >
                            <p style={{ color: 'white', fontSize: 15 }} className="text-medium">
                                Subscribe
                            </p>
                        </button>

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
		minHeight: 300,
		backgroundColor: "white",
		borderRadius: 4,
		borderColor: "#d7d7d7",
		borderStyle: 'solid',
		borderWidth: 1,
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
		height: 40,
		borderWidth: 1,
		borderColor: '#d7d7d7',
		borderStyle: 'solid',
		borderRadius: 4,
		fontSize: 16,
		color: 'black',
        fontFamily: 'FigtreeMedium',
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
		height: 40,
		backgroundColor: CTA_COLOR,
		borderRadius: 4,
        marginBottom: 10
	},
}

const mapStateToProps = (state) => {
	const { mainTextColor } = state.mainReducer

	return { mainTextColor }
}

export default connect(mapStateToProps)(ModalWizaPvP);
