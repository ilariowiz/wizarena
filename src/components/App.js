import React, { Component } from 'react';
import { connect } from 'react-redux'
import {
	setNetworkSettings,
	setNetworkUrl,
	fetchAccountDetails,
	getNumberMinted
} from '../actions'
import { MAIN_NET_ID } from '../actions/types'

const logo = require('../assets/wzlogo_bg_transparent.png')


class App extends Component {
	constructor(props) {
		super(props)

		this.state = {
			showModal: false,
			section: 1
		}
	}

	componentDidMount() {
		document.title = "Wizards Arena"

		this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

		setTimeout(() => {
			this.refreshUser()
			this.minted()
		}, 500)

		setTimeout(() => {
			this.props.history.replace('/collection')
		}, 1500)
	}

	refreshUser() {
		const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props
			//console.log(this.props)
		if (account && account.account) {
			this.props.fetchAccountDetails(account.account, chainId, gasPrice, gasLimit, networkUrl)
		}
	}

	minted() {
		const { chainId, gasPrice, gasLimit, networkUrl } = this.props
		this.props.getNumberMinted(chainId, gasPrice, gasLimit, networkUrl)
	}

	render() {
		//console.log(window)

		return (
			<div style={Object.assign({}, styles.container, { backgroundColor: this.props.mainBackgroundColor })}>
				<img
					src={logo}
					style={{ width: 192, height: 192 }}
					alt='Logo'
				/>
			</div>
		)
	}
}


const styles = {
	container: {
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
}


const mapStateToProps = (state) => {
	const { account, chainId, gasPrice, gasLimit, networkUrl, allNfts, mainBackgroundColor } = state.mainReducer;

	return { account, chainId, gasPrice, gasLimit, networkUrl, allNfts, mainBackgroundColor };
}

export default connect(mapStateToProps, {
	setNetworkSettings,
	setNetworkUrl,
	fetchAccountDetails,
	getNumberMinted
})(App);
