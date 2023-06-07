import React, { Component } from 'react';
import { connect } from 'react-redux'
import moment from 'moment'
import _ from 'lodash'
import { IoMedalOutline } from 'react-icons/io5'
import DotLoader from 'react-spinners/DotLoader';
import getImageUrl from './GetImageUrl'
import '../../css/NftCard.css'
import '../../css/Nft.css'
import { calcLevelWizard, getColorTextBasedOnLevel } from './CalcLevelWizard'
import {
    getInfoNftBurning,
    selectWizard
} from '../../actions'
import { CTA_COLOR } from '../../actions/types'

const logoKda = require('../../assets/kdalogo2.png')

class NftCardStake extends Component {
	constructor(props) {
        super(props)

        this.state = {
            inBurnQueue: this.props.item.confirmBurn,
            infoBurn: {}
        }
    }

	componentDidMount() {
        const { index, item } = this.props

        //per non far partire le connessioni tutte insieme
        const timer = index * 100

        setTimeout(() => {
            if (item.confirmBurn) {
                this.loadInfoBurn()
            }
        }, timer)
	}

    loadInfoBurn() {
        const { item, chainId, gasPrice, gasLimit, networkUrl } = this.props

        this.props.getInfoNftBurning(chainId, gasPrice, gasLimit, networkUrl, item.id, (response) => {
            //console.log(response);
            this.setState({ infoBurn: response })
        })
    }

    renderBurningTop() {
        const { infoBurn } = this.state
        const { mainTextColor } = this.props

        if (!infoBurn.confirmBurn) {
            return <div />
        }

        const burnedFromDate = moment(infoBurn.timestamp.timep).fromNow()

        return (
            <div style={{ flexDirection: 'column', width: '100%', marginRight: 10, alignItems: 'flex-end' }}>

				<p style={{ color: mainTextColor, fontSize: 14, textAlign: 'end' }}>
					In Burning Queue
				</p>

				<p style={{ color: '#707070', fontSize: 13, marginBottom: 2, lineHeight: 1 }}>
					{burnedFromDate}
				</p>
			</div>
        )
    }

	renderStakedTop() {
		const { stakeInfo, mainTextColor } = this.props

		const startStaked = moment(stakeInfo.timestamp.timep).fromNow()
        const multiplier = stakeInfo.multiplier.int

        const diffMinsFromStaked = moment().diff(moment(stakeInfo.timestamp.timep), 'minutes')
        //console.log(diffMinsFromStaked);
        const minAday = 1440
        const daysPassed = (diffMinsFromStaked / minAday)
        const unclaimedWiza = daysPassed * multiplier * 2

		return (
			<div style={{ flexDirection: 'column', width: '100%', marginRight: 10, alignItems: 'flex-end' }}>

				<p style={{ color: mainTextColor, fontSize: 13, lineHeight: 1.2, textAlign: 'end' }}>
					Unclaimed $WIZA
				</p>

				<p style={{ color: mainTextColor, fontSize: 16, marginBottom: 2, lineHeight: 1 }} className="text-medium">
					{_.floor(unclaimedWiza, 4)}
				</p>

				<p style={{ color: '#707070', fontSize: 12, marginBottom: 2, lineHeight: 1 }}>
					{startStaked}
				</p>
			</div>
		)
	}

    calcMedals() {
        const { item } = this.props

        let totalMedals = 0
		if (item.medals && Object.keys(item.medals).length > 0) {
			const arrayValueMedals = Object.values(item.medals)
			arrayValueMedals.map(i => totalMedals = totalMedals + parseInt(i))
		}

        return totalMedals
    }

	render() {
		const { item, history, width, stakeInfo, loading, mainTextColor, isDarkmode } = this.props
		const { inBurnQueue } = this.state

        //console.log(stakeInfo);
        const level = calcLevelWizard(item)

		return (
			<a
                href={`${window.location.protocol}//${window.location.host}/nft/${item.id}`}
				className='container'
				onClick={(e) => {
                    e.preventDefault()
                    this.props.selectWizard(item.id)
                    history.push(`/nft/${item.id}`)
                }}
                style={{ marginBottom: 12 }}
			>
				<img
					style={{ width, height: width, borderTopLeftRadius: 4, borderTopRightRadius: 4 }}
					src={getImageUrl(item.id)}
					alt={`#${item.id}`}
				/>

                <div style={{ width, marginTop: 5, minHeight: 28, alignItems: 'center' }}>
                    <p style={{ color: mainTextColor, fontSize: 14, lineHeight: 1, marginLeft: 10, marginRight: 10 }} className="text-medium">
                        {item.nickname ? `${item.name} ${item.nickname}` : item.name}
                    </p>
                </div>

				<div style={{ justifyContent: 'space-between', width, height: 60, alignItems: 'center' }}>

					<div style={{ width: '100%', flexDirection: 'column', justifyContent: 'center' }}>

                        {
                            item.medals &&
                            <div style={{ alignItems: 'center', marginLeft: 10, marginBottom: 5 }}>

                                <IoMedalOutline
                                    color={mainTextColor}
                                    size={18}
                                    style={{ marginRight: 8 }}
                                />

                                <p style={{ color: mainTextColor, fontSize: 16, lineHeight: 1 }} className="text-medium">
                                    {this.calcMedals()}
                                </p>
                            </div>
                        }

                        {
                            level &&
                            <div style={{ alignItems: 'center', marginLeft: 10 }}>
                                <p style={{ color: mainTextColor, fontSize: 15, marginRight: 7 }}>
                                    Level
                                </p>
                                <p style={{ color: getColorTextBasedOnLevel(level, isDarkmode), fontSize: 16 }} className="text-bold">
                                    {level}
                                </p>
                            </div>
                        }
					</div>

					{
						item.listed ?
						<div style={{ width: '100%', alignItems: 'center', justifyContent: 'flex-end', marginRight: 10 }}>
							<p style={{ color: '#707070', fontSize: 14, lineHeight: 1 }}>
								Price
							</p>

							<div style={{ marginLeft: 10, alignItems: 'center' }}>

								<img
									style={{ width: 19, marginRight: 6, objectFit: 'contain' }}
									src={logoKda}
									alt='Kadena logo'
								/>

								<p style={{ color: mainTextColor, fontSize: 16, lineHeight: 1 }} className="text-bold">
									{item.price}
								</p>
							</div>
						</div>
						: null
					}

					{
						stakeInfo && stakeInfo.staked ?
						this.renderStakedTop()
						: null
					}

                    {
                        inBurnQueue && stakeInfo && !stakeInfo.staked ?
                        this.renderBurningTop()
                        : null
                    }

				</div>

                {/********************* PARTE BOTTOM **********************/}

				{
					loading &&
					<div
						style={Object.assign({}, styles.btnStake, { width })}
					>
						<DotLoader size={16} color={mainTextColor} />
					</div>
				}

                {
                    item.listed && !loading &&
                    <button
						className="btnH"
						style={Object.assign({}, styles.btnStake, { width })}
						onClick={(e) => {
                            e.preventDefault()
							e.stopPropagation()
							this.props.onDelist()
						}}
					>
						<p style={{ fontSize: 15, color: 'white' }} className="text-medium">
							Delist
						</p>
					</button>
                }

                {
                    !item.medals &&
                    <div style={{ height: 40 }} />
                }

				{
					stakeInfo && !stakeInfo.staked && !inBurnQueue && !item.listed && item.medals && !loading &&
                    <div style={{ width, alignItems: 'center', justifyContent: 'space-between' }}>
                        <button
                            className="btnH"
                            style={Object.assign({}, styles.btnStake, { width: (width/2 - 2) })}
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                this.props.onStake()
                            }}
                        >
                            <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                                Stake
                            </p>
                        </button>

    					<button
    						className="btnH"
    						style={Object.assign({}, styles.btnStake, { width: (width/2 - 2), backgroundColor: "#840fb2" })}
    						onClick={(e) => {
                                e.preventDefault()
    							e.stopPropagation()
    							this.props.onAddBurning()
    						}}
    					>
    						<p style={{ fontSize: 15, color: 'white' }} className="text-medium">
    							Burn
    						</p>
    					</button>
                    </div>
				}

                {
                    inBurnQueue && stakeInfo && !stakeInfo.staked && !item.listed && item.medals && !loading &&
					<button
						className="btnH"
						style={Object.assign({}, styles.btnStake, { width, backgroundColor: "#840fb2" })}
						onClick={(e) => {
                            e.preventDefault()
							e.stopPropagation()
							this.props.onRemoveBurning()
						}}
					>
						<p style={{ fontSize: 15, color: 'white' }} className="text-medium">
							Remove from Burning queue
						</p>
					</button>
                }

				{
					stakeInfo && stakeInfo.staked && !item.listed && item.medals && !loading &&
                    <div style={{ width, alignItems: 'center', justifyContent: 'space-between' }}>
                        <button
                            className="btnH"
                            style={Object.assign({}, styles.btnStake, { width: (width/2 - 2) })}
                            onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                this.props.onClaim()
                            }}
                        >
                            <p style={{ fontSize: 14, color: 'white' }} className="text-medium">
                                Claim
                            </p>
                        </button>

    					<button
    						className="btnH"
    						style={Object.assign({}, styles.btnStake, { width: (width/2 - 2) })}
    						onClick={(e) => {
                                e.preventDefault()
    							e.stopPropagation()
    							this.props.onUnstake()
    						}}
    					>
    						<p style={{ fontSize: 14, color: 'white' }} className="text-medium">
    							Claim & Unstake
    						</p>
    					</button>
                    </div>
				}

			</a>
		)
	}
}

const styles = {
	btnStake: {
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		height: 40,
		backgroundColor: CTA_COLOR
	}
}

const mapStateToProps = (state) => {
	const { account, chainId, netId, gasPrice, gasLimit, networkUrl, mainTextColor, isDarkmode } = state.mainReducer

	return { account, chainId, netId, gasPrice, gasLimit, networkUrl, mainTextColor, isDarkmode }
}

export default connect(mapStateToProps, {
    getInfoNftBurning,
    selectWizard
})(NftCardStake);
