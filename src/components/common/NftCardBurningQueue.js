import React, { Component } from 'react';
import { connect } from 'react-redux'
import moment from 'moment'
import getImageUrl from './GetImageUrl'
import { getColorTextBasedOnLevel } from './CalcLevelWizard'
import '../../css/NftCard.css'
import {
	setRank,
	loadSingleNft
} from '../../actions'


class NftCardBurningQueue extends Component {
	constructor(props) {
		super(props)

		this.state = {
			rank: undefined,
			itemInfo: undefined
		}
	}

	componentDidMount() {
		const { item, isBurned, ranks, index } = this.props

		setTimeout(() => {
			this.loadNftId()
		}, index*15)

		//se non è burned
		if (!isBurned) {
			//se non c'è ranks oppure ranks c'è ma non per quell'id
			if (!ranks || (ranks && !ranks[item.idnft])) {
				//console.log(item.idnft);
				this.loadRank(item.idnft)
			}
			else {
				//console.log("abbiamo già rank");
				this.setState({ rank: ranks[item.idnft] })
			}
		}
	}

	loadNftId() {
		const { chainId, gasPrice, gasLimit, networkUrl, item } = this.props

		this.props.loadSingleNft(chainId, gasPrice, gasLimit, networkUrl, item.idnft, (response) => {
			if (response.name) {
				this.setState({ itemInfo: response })
			}
		})
	}

	loadRank(id) {

		let collection = "WizardsArena"
		if (parseInt(id) > 1023 && parseInt(id) <= 2047) {
			collection = "ClericsArena"
		}
		if (parseInt(id) > 2047 && parseInt(id) <= 3071) {
			collection = "DruidsArena"
		}

		fetch(`https://us-central1-raritysniperkda.cloudfunctions.net/app/api/read/${collection}/${id}`)
		.then(response => response.json())
		.then(data => {
			//console.log(data)
			this.setState({ rank: data.rank })
			this.props.setRank(id, data.rank)
		})
		.catch(error => console.log(error))
	}

	render() {
		const { item, history, width, isBurned, mainTextColor, isDarkmode } = this.props
		const { rank, itemInfo } = this.state

		const from = !isBurned ? moment(item.timestamp.timep).fromNow() : ""

		const level = itemInfo ? itemInfo.level : undefined
		//console.log(item);

		return (
			<a
				href={`${window.location.protocol}//${window.location.host}/nft/${item.idnft}`}
				className='container'
				onClick={(e) => {
					e.preventDefault()
					history.push(`/nft/${item.idnft}`)
				}}
			>
				<img
					style={{ width, height: width, borderTopLeftRadius: 4, borderTopRightRadius: 4 }}
					src={getImageUrl(item.idnft)}
					alt={`#${item.idnft}`}
				/>

				<div style={{ justifyContent: 'space-between', width, height: 70, alignItems: 'center' }}>

					<div style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>

						<div style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
							<p style={{ color: mainTextColor, fontSize: 16, marginLeft: 10, marginBottom: 4 }} className="text-medium">
								#{item.idnft}
							</p>

							{
								rank && !isBurned &&
								<div style={{ alignItems: 'center', marginLeft: 10, marginBottom: 4 }}>
									<p style={{ color: mainTextColor, fontSize: 14, marginRight: 10 }}>
										Rank
									</p>

									<p style={{ color: mainTextColor, fontSize: 15 }} className="text-medium">
										{rank}
									</p>
								</div>
							}

							{
								level &&
								<div style={{ alignItems: 'center', marginLeft: 10 }}>
									<p style={{ color: mainTextColor, fontSize: 14, marginRight: 10 }}>
										Level
									</p>

									<p style={{ color: getColorTextBasedOnLevel(level, isDarkmode), fontSize: 16 }} className="text-bold">
										{level}
									</p>
								</div>
							}
						</div>


						{
							!isBurned &&
							<div style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
								<p style={{ color: mainTextColor, fontSize: 15, marginRight: 10, marginBottom: 4 }}>
									In Queue
								</p>

								<p style={{ color: mainTextColor, fontSize: 13, marginRight: 10 }}>
									{from}
								</p>
							</div>
						}

						{
							item.rank &&
							<div style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
								<p style={{ color: mainTextColor, fontSize: 15, marginRight: 10 }}>
									Rank
								</p>

								<p style={{ color: mainTextColor, fontSize: 14, marginRight: 10 }} className="text-medium">
									{item.rank}
								</p>
							</div>
						}

					</div>

				</div>
			</a>
		)
	}
}

const mapStateToProps = (state) => {
	const { chainId, gasPrice, gasLimit, networkUrl, mainTextColor, isDarkmode } = state.mainReducer
	const { ranks } = state.rankReducer

	return { ranks, chainId, gasPrice, gasLimit, networkUrl, mainTextColor, isDarkmode }
}

export default connect(mapStateToProps, {
	setRank,
	loadSingleNft
})(NftCardBurningQueue);
