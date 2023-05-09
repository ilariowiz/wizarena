import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import { TEST_NET_ID, CTA_COLOR } from '../../actions/types'


class HistoryItemNft extends Component {
	render() {
		const { item, index, nftH, netId, isMobile, type, mainTextColor } = this.props

		let removeBorder = index + 1 === nftH.length

		let url = ''
		if (netId === TEST_NET_ID) {
			url = `https://explorer.chainweb.com/testnet/tx/${item.requestKey}`
		}
		else {
			url = `https://explorer.chainweb.com/mainnet/tx/${item.requestKey}`
		}


		let styleData = item.requestKey ? styles.dataRequest : styles.dataNonRequest

		return (
			<div style={Object.assign({}, styles.boxSingleHistory, { borderBottomWidth: removeBorder ? 0 : 1 })} key={item.blockHash}>

				<p style={{ fontSize: 15, color: mainTextColor, width: '15%', marginLeft: 20 }}>
					{type}
				</p>

				{
					item.amount ?
					<p style={{ fontSize: 16, color: mainTextColor, width: '15%' }}>
						KDA {item.amount}
					</p>
					:
					<p style={{ fontSize: 16, color: mainTextColor, width: '15%' }}>

					</p>
				}

				{
					item.owner ?
					<p style={{ fontSize: 14, color: mainTextColor, width: '24%' }}>
						Owner {item.owner.slice(0, 10)}...
					</p>
					:
					undefined
				}


				{
					!isMobile && item.from &&
					<p style={{ fontSize: 14, color: mainTextColor, width: '24%' }}>
						From {item.from.slice(0, 10)}...
					</p>
				}

				{
					item.to ?
					<p style={{ fontSize: 14, color: mainTextColor, width: '24%' }}>
						To {item.to.slice(0, 10)}...
					</p>
					:
					undefined
				}

				{
					!item.to && !isMobile &&
					<p style={{ fontSize: 14, color: mainTextColor, width: '24%' }}>

					</p>
				}

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
		height: 50,
		width: '100%'
	},
	dataRequest: {
		fontSize: 16,
		color: CTA_COLOR,
		width: '22%',
		cursor: 'pointer',
		textAlign: 'right'
	},
	dataNonRequest: {
		fontSize: 15,
		color: 'white',
		width: '22%',
		textAlign: 'right'
	}
}

const mapStateToProps = (state) => {
	const { netId, mainTextColor } = state.mainReducer

	return { netId, mainTextColor }
}

export default connect(mapStateToProps)(HistoryItemNft)
