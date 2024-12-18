import React, { Component } from 'react'
import { connect } from 'react-redux'
import moment from 'moment'
import getImageUrl from './GetImageUrl'
import { TEST_NET_ID, CTA_COLOR } from '../../actions/types'


class HistoryItem extends Component {
	render() {
		const { item, index, nftH, netId, isMobile, mainTextColor } = this.props

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

				{
					!isMobile &&
					<img
						src={getImageUrl(item.idnft)}
						style={{ width: 52, height: 52, borderRadius: 2, borderColor: 'white', borderStyle: 'solid', borderWidth: 1 }}
						alt={item.idnft}
					/>
				}

				<a
					href={`${window.location.protocol}//${window.location.host}/nft/${item.idnft}`}
					style={{ marginLeft: 20, flex: 0.6, display: 'flex', alignItems: 'flex-start', cursor: 'pointer' }}
					onClick={(e) => {
						e.preventDefault()
						this.props.history.push(`./nft/${item.idnft}`)
					}}
				>
					<p style={{ fontSize: 16, color: CTA_COLOR }} className="text-medium">
						#{item.idnft}
					</p>
				</a>

				<p style={{ fontSize: 15, color: mainTextColor, flex: 0.6 }} className="text-medium">
					KDA {item.amount}
				</p>

				{
					!isMobile &&
					<p style={{ fontSize: 13, color: mainTextColor, flex: 1 }}>
						From {item.from.slice(0, 15)}...
					</p>
				}

				<p style={{ fontSize: 13, color: mainTextColor, flex: 1 }}>
					To {item.to.slice(0, 15)}...
				</p>

				<p
					style={Object.assign({}, styleData, { color: item.requestKey ? CTA_COLOR : mainTextColor })}
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
		height: 60
	},
	dataRequest: {
		fontSize: 15,
		flex: 0.6,
		cursor: 'pointer',
		textAlign: 'right'
	},
	dataNonRequest: {
		fontSize: 15,
		flex: 0.6,
		textAlign: 'right'
	}
}

const mapStateToProps = (state) => {
	const { netId, mainTextColor } = state.mainReducer

	return { netId, mainTextColor }
}

export default connect(mapStateToProps)(HistoryItem)
