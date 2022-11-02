import React, { Component } from 'react';
import { connect } from 'react-redux'
import moment from 'moment'
import DotLoader from 'react-spinners/DotLoader';
import getImageUrl from './GetImageUrl'
import '../../css/NftCard.css'
import '../../css/Nft.css'
import {
    getWizardStakeInfo,
	calculateReward
} from '../../actions'
import { CTA_COLOR } from '../../actions/types'

const logoKda = require('../../assets/kdalogo2.png')

class NftCardStake extends Component {
	constructor(props) {
        super(props)

        this.state = {
            stakeInfo: {},
			staked: false,
			unclaimedWiza: 0.0,
			loading: true
        }
    }

	componentDidMount() {
		const { item, chainId, gasPrice, gasLimit, networkUrl } = this.props

        //console.log(item, tournament);
        this.props.getWizardStakeInfo(chainId, gasPrice, gasLimit, networkUrl, item.id, (response) => {
            //console.log(response)

			if (response.status === "failure") {
				this.setState({ staked: false, stakeInfo: {}, loading: false })
			}
			else {
				this.setState({ staked: response.staked, stakeInfo: response, loading: false })

				const stakedFromDate = moment(response.timestamp.timep)

				const diffMinsFromStaked = moment().diff(stakedFromDate, 'minutes')
				//console.log(diffMinsFromStaked);

				const minAday = 1440

				const daysPassed = (diffMinsFromStaked / minAday)

				this.props.calculateReward(chainId, gasPrice, gasLimit, networkUrl, daysPassed, response.multiplier.int, (response) => {
					this.setState({ unclaimedWiza: response.decimal.substring(0, 6) })
				})
			}
        })
	}

	renderStaked() {
		const { unclaimedWiza, stakeInfo } = this.state

		//console.log(unclaimedWiza);

		const startStaked = moment(stakeInfo.timestamp.timep).fromNow()

		return (
			<div style={{ flexDirection: 'column', width: '100%', marginRight: 10, alignItems: 'flex-end' }}>

				<p style={{ color: 'white', fontSize: 14, lineHeight: 1.2, textAlign: 'end' }}>
					UNCLAIMED $WIZA
				</p>

				<p style={{ color: 'white', fontSize: 16, marginBottom: 2, lineHeight: 1 }}>
					{unclaimedWiza}
				</p>

				<p style={{ color: '#c2c0c0', fontSize: 12, marginBottom: 2, lineHeight: 1 }}>
					{startStaked}
				</p>
			</div>
		)
	}

	render() {
		const { item, history, width, reveal } = this.props
		const { staked, loading } = this.state

		return (
			<div
				className='container'
				onClick={() => history.push(`/nft/${item.id}`)}
			>
				<img
					style={{ width, height: width, borderTopLeftRadius: 2, borderTopRightRadius: 2 }}
					src={getImageUrl(item.id, reveal)}
					alt={`#${item.id}`}
				/>

				<div style={{ justifyContent: 'space-between', width, height: 70, alignItems: 'center' }}>

					<div style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
						<p style={{ color: 'white', fontSize: 18, marginLeft: 10, lineHeight: 1 }}>
							{item.name}
						</p>
					</div>

					{
						item.listed ?
						<div style={{ width: '100%', alignItems: 'center', justifyContent: 'flex-end', marginRight: 10 }}>
							<p style={{ color: '#c2c0c0', fontSize: 14, lineHeight: 1 }}>
								PRICE
							</p>

							<div style={{ marginLeft: 10, alignItems: 'center' }}>

								<img
									style={{ width: 19, marginRight: 6, objectFit: 'contain', marginBottom: 6 }}
									src={logoKda}
									alt='Kadena logo'
								/>

								<p style={{ color: 'white', fontSize: 20, marginBottom: 2, lineHeight: 1 }}>
									{item.price}
								</p>
							</div>
						</div>
						: null
					}

					{
						staked ?
						this.renderStaked()
						: null
					}

				</div>


				{
					loading &&
					<div
						style={Object.assign({}, styles.btnStake, { width })}
					>
						<DotLoader size={25} color='white' />
					</div>
				}

				{
					!staked && !loading &&
					<button
						className="btnH"
						style={Object.assign({}, styles.btnStake, { width })}
						onClick={(e) => {
							e.stopPropagation()
							this.props.onStake()
						}}
					>
						<p style={{ fontSize: 17, color: 'white' }}>
							STAKE
						</p>
					</button>
				}

				{
					staked && !loading &&
					<button
						className="btnH"
						style={Object.assign({}, styles.btnStake, { width })}
						onClick={(e) => {
							e.stopPropagation()
							this.props.onUnstake()
						}}
					>
						<p style={{ fontSize: 17, color: 'white' }}>
							CLAIM & UNSTAKE
						</p>
					</button>
				}

			</div>
		)
	}
}

const styles = {
	btnStake: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		height: 50,
		backgroundColor: CTA_COLOR
	}
}

const mapStateToProps = (state) => {
	const { reveal, account, chainId, netId, gasPrice, gasLimit, networkUrl } = state.mainReducer

	return { reveal, account, chainId, netId, gasPrice, gasLimit, networkUrl }
}

export default connect(mapStateToProps, {
	getWizardStakeInfo,
	calculateReward
})(NftCardStake);
