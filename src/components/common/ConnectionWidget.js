import React, { Component } from 'react'
import { connect } from 'react-redux'
import DotLoader from 'react-spinners/DotLoader';
import {
	fetchAccountDetails,
	setConnectedWallet
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
			useXWallet: false
		}
	}

	componentDidMount() {
		setTimeout(() => {
			this.hasXWallet = window && window.kadena && window.kadena.isKadena === true
			//console.log("hasXWallet", this.hasXWallet)
		}, 500)

	}

	checkAddress(e) {
		const { address } = this.state;

		if (!address || address.trim().length === 0) {
			return
		}

		this.setState({ loading: true })

		const { chainId, gasPrice, gasLimit, networkUrl } = this.props
		//console.log(this.props)

		//console.log(accountAddr)
		this.props.fetchAccountDetails(address, chainId, gasPrice, gasLimit, networkUrl, (error) => {
			if (!error) {
				//console.log("utente salvato!")
				this.connectWallet(this.props.account)
			}
			else {
				console.log(error)
				//console.log("address non valido o inesistente")
				this.setState({ error: 'Invalid or non-existent address', loading: false })
			}
		})
	}

	//serve per connettere X-Wallet nel caso utente abbiamo installato x-wallet e stia usando chrome
	connectWallet(account) {
		const { chainId, netId } = this.props
		const { useXWallet } = this.state

		this.props.setConnectedWallet(account, useXWallet, netId, chainId, (error) => {
			this.setState({ loading: false }, () => {

				if (!error) {
					this.props.callback()
				}
				else {
					this.setState({ error })
				}

			})
		})
	}

	render() {
		const { error, loading, useXWallet } = this.state

		const switchStyle = useXWallet ? "switchbase switchon" : "switchbase switchoff"

		return (
			<div
				style={styles.boxWallet}
			>
				<input
					style={styles.input}
					type='text'
					placeholder='Kadena address'
					value={this.state.address}
					onChange={(e) => this.setState({ address: e.target.value })}
				/>

				{
					this.hasXWallet &&
					<div style={{ justifyContent: 'center', alignItems: 'center', width: '100%', marginBottom: 30 }}>
						<p style={{ fontSize: 16, color: 'white', marginRight: 20 }}>
							Use X-Wallet
						</p>

						<div
							style={styles.boxSwitch}
							onClick={() => this.setState({ useXWallet: !this.state.useXWallet })}
						>
							<div className={switchStyle} />
						</div>
					</div>
				}

				{
					loading ?
					<div style={{ height: 45 }}>
						<DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
					</div>
					:
					<button
						className='btnH'
						style={styles.btnConnect}
						onClick={() => this.checkAddress()}
					>
						<p style={{ color: 'white', fontSize: 19 }}>
							Connect
						</p>
					</button>
				}


				{
					error && !loading &&
					<p style={{ color: 'red', fontSize: 14, marginTop: 20 }}>
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
	boxSwitch: {
		width: 60,
		height: 30,
		backgroundColor: 'lightgrey',
		borderRadius: 15,
		position: 'relative',
		cursor: 'pointer'
	}
}

const mapStateToProps = (state) => {
	const { account, chainId, gasPrice, gasLimit, networkUrl, netId } = state.mainReducer;

	return { account, chainId, gasPrice, gasLimit, networkUrl, netId };
}

export default connect(mapStateToProps, {
	fetchAccountDetails,
	setConnectedWallet
})(ConnectionWidget)
