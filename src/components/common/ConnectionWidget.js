import React, { Component } from 'react'
import { connect } from 'react-redux'
import DotLoader from 'react-spinners/DotLoader';
import {
	fetchAccountDetails,
	connectXWallet,
	connectChainweaver,
	connectWalletConnect
} from '../../actions'
import '../../css/ConnectionWidget.css'
import { TEXT_SECONDARY_COLOR, CTA_COLOR } from '../../actions/types'
import '../../css/Nft.css'


class ConnectionWidget extends Component {
	constructor(props) {
		super(props)

		this.hasXWallet = false

		this.state = {
			address: '',
			loading: false,
			error: '',
			useXWallet: false,
			showInput: false
		}
	}

	componentDidMount() {
		setTimeout(() => {
			this.hasXWallet = window && window.kadena && window.kadena.isKadena === true
			//console.log("hasXWallet", this.hasXWallet)
		}, 500)

	}

	connectXWallet() {
		const { netId, chainId, gasPrice, gasLimit, networkUrl } = this.props

		this.setState({ loading: true })

		this.props.connectXWallet(netId, chainId, gasPrice, gasLimit, networkUrl, (error) => {
			if (!error) {
				this.props.callback()
			}
			else {
				this.setState({ error })
			}
		})
	}

	connectWalletConnect() {
		const { netId, chainId, gasPrice, gasLimit, networkUrl } = this.props

		this.setState({ loading: true })

		this.props.connectWalletConnect(netId, chainId, gasPrice, gasLimit, networkUrl, (error) => {
			if (!error) {
				this.props.callback()
			}
			else {
				this.setState({ error })
			}
		})
	}

	connectChainweaver() {
		const { address } = this.state;

		if (!address || address.trim().length === 0) {
			return
		}

		this.setState({ loading: true })

		const { chainId, gasPrice, gasLimit, networkUrl } = this.props
		//console.log(this.props)

		//console.log(accountAddr)
		this.props.connectChainweaver(address, chainId, gasPrice, gasLimit, networkUrl, (error) => {
			if (!error) {
				//console.log("utente salvato!")
				this.props.callback()
			}
			else {
				console.log(error)
				//console.log("address non valido o inesistente")
				this.setState({ error: 'Invalid or non-existent address', loading: false })
			}
		})
	}

	render() {
		const { error, loading, showInput } = this.state

		if (loading) {
			return (
				<div style={{ height: 45 }}>
					<DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
				</div>
			)
		}

		return (
			<div
				style={styles.boxWallet}
			>

				<button
					className="btnH xwallet"
					style={styles.btnOption}
					onClick={() => {
						this.setState({ useXWallet: true })
						this.connectXWallet()
					}}
				>
					<p style={{ fontSize: 17, color: 'black' }}>
						X-WALLET
					</p>
				</button>

				<button
					className="btnH"
					style={Object.assign({}, styles.btnOption, { backgroundColor: "#57b5e1" })}
					onClick={() => this.setState({ showInput: true })}
				>
					<p style={{ fontSize: 17, color: 'black' }}>
						CHAINWEAVER / ZELCORE
					</p>
				</button>

				<button
					className="btnH"
					style={Object.assign({}, styles.btnOption, { backgroundColor: "#3396ff", marginBottom: 0 })}
					onClick={() => this.connectWalletConnect()}
				>
					<p style={{ fontSize: 17, color: 'black' }}>
						WALLETCONNECT
					</p>
				</button>

				{
					showInput ?
					<div style={{ marginTop: 20 }}>
						<input
							style={styles.input}
							type='text'
							placeholder='Kadena address'
							value={this.state.address}
							onChange={(e) => this.setState({ address: e.target.value })}
						/>

						<button
							className="btnH"
							style={Object.assign({}, styles.btnOption, { width: 70 })}
							onClick={() => this.connectChainweaver()}
						>
							<p style={{ fontSize: 14, color: 'white' }}>
								CONNECT
							</p>
						</button>
					</div>
					: null
				}



				{
					error && !loading &&
					<p style={{ color: 'red', fontSize: 14, marginTop: 10 }}>
						{error}
					</p>
				}

			</div>
		)
	}
}


const styles = {
	boxWallet: {
		flexDirection: 'column',
		backgroundColor: 'transparent',
		padding: 12,
		alignItems: 'center',
	},
	input: {
		width: 166,
		height: 40,
		borderWidth: 1,
		borderColor: 'lightgrey',
		borderStyle: 'solid',
		borderRadius: 2,
		fontSize: 14,
		color: 'black',
		paddingLeft: 16,
		paddingRight: 16,
		marginBottom: 20,
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
	boxSwitch: {
		width: 60,
		height: 30,
		backgroundColor: 'lightgrey',
		borderRadius: 15,
		position: 'relative',
		cursor: 'pointer'
	},
	btnOption: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		width: 272,
		height: 44,
		borderWidth: 2,
		borderRadius: 2,
		borderColor: CTA_COLOR,
		borderStyle: 'solid',
		marginBottom: 20
	}
}

const mapStateToProps = (state) => {
	const { account, chainId, gasPrice, gasLimit, networkUrl, netId } = state.mainReducer;

	return { account, chainId, gasPrice, gasLimit, networkUrl, netId };
}

export default connect(mapStateToProps, {
	fetchAccountDetails,
	connectXWallet,
	connectChainweaver,
	connectWalletConnect
})(ConnectionWidget)
