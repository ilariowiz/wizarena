import React, { Component } from 'react'
import { connect } from 'react-redux'
import Media from 'react-media';
import { AiOutlineTwitter } from 'react-icons/ai'
import Header from './Header'
import getBoxWidth from './common/GetBoxW'
import { BACKGROUND_COLOR, CTA_COLOR } from '../actions/types'
import {
	logout
} from '../actions'


class Settings extends Component {
	componentDidMount() {
		document.title = "Settings - Wizards Arena"
	}

	renderBody(isMobile) {
        const { account, isXWallet, netId } = this.props

		const { boxW } = getBoxWidth(isMobile)

		let wList = boxW * 60 / 100
		if (wList < 320) {
			wList = 320
		}

		let marginBottom = 50

		return (
			<div style={{ flexDirection: 'column', width: boxW, marginTop: 30, alignItems: 'center' }}>

				<p style={{ fontSize: 24, color: 'white', marginBottom }}>
					Settings
				</p>

				<div style={{ width: wList, marginBottom, flexDirection: 'column' }}>

                    <p style={{ fontSize: 21, color: 'white', marginBottom: 15 }}>
                        Wallet address
                    </p>

                    <p style={{ fontSize: 15, color: 'white', overflowWrap: 'anywhere' }}>
                        {account.account}
                    </p>

                    {
                        isXWallet ?
                        <p style={{ fontSize: 16, color: 'white', marginTop: 15 }}>
                            <i>Connected to X-Wallet</i>
                        </p>
                        : null
                    }

				</div>

                <div style={{ width: wList, marginBottom, flexDirection: 'column' }}>

                    <p style={{ fontSize: 21, color: 'white', marginBottom: 15 }}>
                        Contact us
                    </p>

                    <div>
                        <button
                            style={{ flexDirection: 'row', display: 'flex' }}
							onClick={() => window.open("https://twitter.com/WizardArena", "_blank")}
                        >
							<AiOutlineTwitter
								color={CTA_COLOR}
								size={29}
							/>
							<p style={{ fontSize: 18, color: 'white', marginLeft: 10 }}>
								@WizardsArena
							</p>

                        </button>

                    </div>

				</div>

				<div style={{ width: wList, marginBottom, borderTopWidth: 1, borderColor: 'grey', borderStyle: 'solid', borderRight: 0, borderLeft: 0, borderBottom: 0, paddingTop: 20 }}>

                    <button
                        style={styles.btnLogout}
                        onClick={() => {
                            this.props.logout(isXWallet, netId)
                            this.props.history.replace('/collection')
                        }}
                    >
                        <p style={{ fontSize: 19, color: 'red' }}>
                            Logout
                        </p>
                    </button>
				</div>

			</div>
		)
	}

	renderTopHeader(isMobile) {
		const { account } = this.props

		return (
			<div style={{ width: '100%' }}>
				<Header
					page='settings'
					account={account}
					isMobile={isMobile}
                    history={this.props.history}
				/>
			</div>
		)
	}

	render() {
		return (
			<div style={styles.container}>

				<Media
					query="(max-width: 767px)"
					render={() => this.renderTopHeader(true)}
				/>

				<Media
					query="(min-width: 768px)"
					render={() => this.renderTopHeader(false)}
				/>

				<Media
					query="(max-width: 767px)"
					render={() => this.renderBody(true)}
				/>

				<Media
					query="(min-width: 768px)"
					render={() => this.renderBody(false)}
				/>
			</div>
		)
	}
}

const styles = {
	container: {
		flexDirection: 'column',
		alignItems: 'center',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: BACKGROUND_COLOR
	},
	btnLogout: {
        height: 40,
        width: 120,
        borderRadius: 2,
        borderColor: 'red',
        borderWidth: 2,
        borderStyle: 'solid'
    }
}

const mapStateToProps = (state) => {
	const { account, isXWallet, netId } = state.mainReducer;

	return { account, isXWallet, netId };
}

export default connect(mapStateToProps, {
    logout
})(Settings);
