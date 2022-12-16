import React, { Component } from 'react';
import { connect } from 'react-redux'
import moment from 'moment'
import getImageUrl from './GetImageUrl'
import '../../css/NftCard.css'
import {
	setRank
} from '../../actions'


class NftCardBurningQueue extends Component {
	constructor(props) {
		super(props)

		this.state = {
			rank: undefined
		}
	}

	componentDidMount() {
		const { item, isBurned, ranks } = this.props

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

	loadRank(id) {
		fetch(`https://us-central1-raritysniperkda.cloudfunctions.net/app/api/read/WizardsArena/${id}`)
		.then(response => response.json())
		.then(data => {
			//console.log(data)
			this.setState({ rank: data.rank })
			this.props.setRank(id, data.rank)
		})
		.catch(error => console.log(error))
	}

	render() {
		const { item, history, width, isBurned } = this.props
		const { rank } = this.state

		const from = !isBurned ? moment(item.timestamp.timep).fromNow() : ""

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
					style={{ width, height: width, borderTopLeftRadius: 2, borderTopRightRadius: 2 }}
					src={getImageUrl(item.idnft)}
					alt={`#${item.idnft}`}
				/>

				<div style={{ justifyContent: 'space-between', width, height: 55, alignItems: 'center' }}>

					<div style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 }}>

						<div style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
							<p style={{ color: 'white', fontSize: 19, marginLeft: 10, lineHeight: 1, marginBottom: 4 }}>
								#{item.idnft}
							</p>

							{
								rank && !isBurned &&
								<p style={{ color: '#c2c0c0', fontSize: 14, marginLeft: 10, lineHeight: 1 }}>
									Rank {rank}
								</p>
							}
						</div>


						{
							!isBurned &&
							<div style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
								<p style={{ color: 'white', fontSize: 16, marginRight: 10, lineHeight: 1, marginBottom: 4 }}>
									IN QUEUE
								</p>

								<p style={{ color: '#c2c0c0', fontSize: 14, marginRight: 10, lineHeight: 1 }}>
									{from}
								</p>
							</div>
						}

						{
							item.rank &&
							<div style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
								<p style={{ color: 'white', fontSize: 16, marginRight: 10, lineHeight: 1 }}>
									RANK
								</p>

								<p style={{ color: '#c2c0c0', fontSize: 14, marginRight: 10, lineHeight: 1 }}>
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
	const { ranks } = state.rankReducer

	return { ranks }
}

export default connect(mapStateToProps, {
	setRank
})(NftCardBurningQueue);
