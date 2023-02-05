import React, { Component } from 'react';
import { IoClose } from 'react-icons/io5'
import '../../css/Modal.css'
import { TEXT_SECONDARY_COLOR, BACKGROUND_COLOR, CTA_COLOR } from '../../actions/types'


class ModalTransfer extends Component {
    constructor(props) {
		super(props)

		this.state = {
			addr: '',
            loading: false
		}
	}

    async startTransfer() {
        const { addr } = this.state
        if (!addr) {
            return
        }

        if (addr.includes(".") && !this.state.loading) {
            this.setState({ loading: true })
            const response = await fetch(`https://www.kadenanames.com/api/v1/address/${addr}`);
            const { address } = await response.json();
            //console.log(address);
            this.setState({ loading: false })
            this.props.callback(address)
        }
        else {
            this.props.callback(addr)
        }
    }

	render() {
		const { showModal, onCloseModal, width } = this.props;
        const { loading } = this.state

		const classContainer = showModal ? "containerPopup" : "hidePopup"

		return (
			<div className={classContainer}>
				<div style={Object.assign({}, styles.subcontainer, { width })}>

					<p style={{ color: 'white', fontSize: 18, textAlign: 'center' }}>
						Paste the k: wallet or KadenaName of the receiver
					</p>

					<div style={styles.boxWallet}>
                        <input
                            style={styles.input}
                            type='text'
                            placeholder='Kadena address'
                            value={this.state.addr}
                            onChange={(e) => this.setState({ addr: e.target.value })}
                        />

                        <button
                            className='btnH'
                            style={styles.btnConnect}
                            onClick={() => this.startTransfer()}
                        >
                            <p style={{ color: 'white', fontSize: 19 }}>
                                {loading ? "Loading..." : "Transfer"}
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
		position: 'relative',
        padding: 10
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
