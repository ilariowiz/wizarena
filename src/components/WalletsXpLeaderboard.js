import React, { Component } from 'react'
import { connect } from 'react-redux'
import Media from 'react-media';
import Header from './Header'
import DotLoader from 'react-spinners/DotLoader';
import getBoxWidth from './common/GetBoxW'
import {
    setNetworkSettings,
    setNetworkUrl,
    getWalletsXp
} from '../actions'
import { MAIN_NET_ID, TEXT_SECONDARY_COLOR } from '../actions/types'


class WalletsXpLeaderboard extends Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: true,
            error: "",
            wallets: []
        }
    }

    componentDidMount() {
		document.title = "Wallets XP Leaderboard - Wizards Arena"

        this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

        setTimeout(() => {
            this.loadWallets()
        }, 500)
	}

    loadWallets() {
		const { chainId, gasPrice, gasLimit, networkUrl } = this.props

        this.props.getWalletsXp(chainId, gasPrice, gasLimit, networkUrl, (response) => {

            response.sort((a, b) => {
                return b.xp.int - a.xp.int
            })

            //console.log(response);

            this.setState({ wallets: response, loading: false })
        })
	}

    renderRow(item, index, isMobile) {
        const { mainTextColor, account, isDarkmode } = this.props

        let walletColor = mainTextColor
        if (account && item.account === account.account) {
            if (isDarkmode) {
                walletColor = "gold"
            }
            else {
                walletColor = "#840fb2"
            }
        }

        return (
			<div style={{ alignItems: 'center', justifyContent: 'space-between', width: 300, position: 'relative', paddingBottom: 10 }} key={index}>
                <p style={{ fontSize: 16, color: mainTextColor, marginRight: 20, width: 27 }}>
                    {index+1}
                </p>

                <p style={{ fontSize: 16, color: walletColor, marginRight: 20, flex: 1 }} className="text-regular">
                    {item.account.slice(0, 10)}...{item.account.slice(item.account.length-6, item.account.length)}
                </p>

                <p style={{ fontSize: 18, color: TEXT_SECONDARY_COLOR, marginBottom: 7 }}>
                    {item.xp.int}
                </p>

                <div style={{ height: 1, width: '100%', backgroundColor: "#d7d7d7", marginTop: 5, marginBottom: 5, position: 'absolute', bottom: 0 }} />
            </div>
		)
    }

    renderBody(isMobile) {
        const { loading, error, wallets } = this.state
        const { mainTextColor } = this.props

        const { boxW, padding } = getBoxWidth(isMobile)

        return (
            <div style={{ flexDirection: 'column', alignItems: 'center', width: boxW, padding, paddingTop: 30, overflowY: 'auto', overflowX: 'hidden' }}>
                <p style={{ color: mainTextColor, fontSize: 24, marginBottom: 20 }} className="text-medium">
                    Wallets XP Leaderboard
                </p>

                {
					loading ?
					<div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', paddingTop: 30 }}>
						<DotLoader size={25} color={mainTextColor} />
					</div>
					: null
				}

                <div style={{ width: '100%', maxWidth: 900, flexDirection: 'column', alignItems: 'center' }}>
                    {wallets && wallets.map((item, index) => {
                        return this.renderRow(item, index, isMobile)
                    })}
                </div>

                {
                    error &&
                    <p style={{ fontSize: 15, color: 'red' }}>
                        {error}
                    </p>
                }
            </div>
        )
    }

    renderTopHeader(isMobile) {
		const { account } = this.props

		return (
			<div>
				<Header
					page='home'
					section={6}
					account={account}
					isMobile={isMobile}
					history={this.props.history}
				/>
			</div>
		)
	}

    render() {
		return (
			<div style={Object.assign({}, styles.container, { backgroundColor: this.props.mainBackgroundColor })}>
				<Media
					query="(max-width: 999px)"
					render={() => this.renderTopHeader(true)}
				/>

				<Media
					query="(min-width: 1000px)"
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
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
}

const mapStateToProps = (state) => {
    const { chainId, gasPrice, gasLimit, networkUrl, account, mainTextColor, mainBackgroundColor, isDarkmode } = state.mainReducer

    return { chainId, gasPrice, gasLimit, networkUrl, account, mainTextColor, mainBackgroundColor, isDarkmode }
}

export default connect(mapStateToProps, {
    setNetworkSettings,
    setNetworkUrl,
    getWalletsXp
})(WalletsXpLeaderboard)
