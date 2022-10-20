import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import { TEST_NET_ID, CTA_COLOR } from '../../actions/types'


class HistoryItem extends Component {
	render() {
		const { item, index, nftH, netId, isMobile, isAll } = this.props

		let removeBorder = index + 1 === nftH.length

		let url = ''
		if (netId === TEST_NET_ID) {
			url = `https://explorer.chainweb.com/testnet/tx/${item.requestKey}`
		}
		else {
			url = `https://explorer.chainweb.com/mainnet/tx/${item.requestKey}`
		}


		let styleData = item.requestKey ? styles.dataRequest : styles.dataNonRequest

		const params = item.params

		if (params.length < 4) {
			return <div />
		}

		return (
			<div style={Object.assign({}, styles.boxSingleHistory, { borderBottomWidth: removeBorder ? 0 : 1 })} key={item.blockHash}>

				{
					isAll ?
					<button
						style={{ marginLeft: 20, flex: 0.6, display: 'flex', alignItems: 'flex-start' }}
						onClick={() => this.props.history.push(`./nft/${params[0]}`)}
					>
						<p style={{ fontSize: 17, color: CTA_COLOR }}>
							#{params[0]}
						</p>
					</button>
					: null
				}

				<p style={{ fontSize: 17, color: 'white', flex: 0.6, marginLeft: isAll ? 0 : 20 }}>
					KDA {params[3]}
				</p>

				{
					!isMobile &&
					<p style={{ fontSize: 15, color: 'white', flex: 1 }}>
						From {params[2].slice(0, 15)}...
					</p>
				}

				<p style={{ fontSize: 15, color: 'white', flex: 1 }}>
					To {params[1].slice(0, 15)}...
				</p>

				<p
					style={styleData}
					onClick={() => {
						if (item.requestKey) {
							window.open(url, "_blank")
						}
					}}
				>
					{moment().to(item.blockTime)}
				</p>

				<div style={{ width: 20 }} />
			</div>
		)
	}
}

const styles = {
	boxSingleHistory: {
		justifyContent: 'space-between',
		alignItems: 'center',
		borderBottomWidth: 1,
		borderTopWidth: 0,
		borderLeftWidth: 0,
		borderRightWidth: 0,
		borderColor: '#ededed',
		borderStyle: 'solid',
		height: 50
	},
	dataRequest: {
		fontSize: 16,
		color: CTA_COLOR,
		flex: 0.6,
		cursor: 'pointer',
		textAlign: 'right'
	},
	dataNonRequest: {
		fontSize: 15,
		color: 'white',
		flex: 0.6,
		textAlign: 'right'
	}
}

const mapStateToProps = (state) => {
	const { netId } = state.mainReducer

	return { netId }
}

export default connect(mapStateToProps)(HistoryItem)
