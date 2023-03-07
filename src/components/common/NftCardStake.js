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

        if (!infoBurn.confirmBurn) {
            return <div />
        }

        const burnedFromDate = moment(infoBurn.timestamp.timep).fromNow()

        return (
            <div style={{ flexDirection: 'column', width: '100%', marginRight: 10, alignItems: 'flex-end' }}>

				<p style={{ color: 'white', fontSize: 16, lineHeight: 1.2, textAlign: 'end' }}>
					IN BURNING QUEUE
				</p>

				<p style={{ color: '#c2c0c0', fontSize: 12, marginBottom: 2, lineHeight: 1 }}>
					{burnedFromDate}
				</p>
			</div>
        )
    }

	renderStakedTop() {
		const { stakeInfo } = this.props

		const startStaked = moment(stakeInfo.timestamp.timep).fromNow()
        const multiplier = stakeInfo.multiplier.int

        const diffMinsFromStaked = moment().diff(moment(stakeInfo.timestamp.timep), 'minutes')
        //console.log(diffMinsFromStaked);
        const minAday = 1440
        const daysPassed = (diffMinsFromStaked / minAday)
        const unclaimedWiza = daysPassed * multiplier * 4

		return (
			<div style={{ flexDirection: 'column', width: '100%', marginRight: 10, alignItems: 'flex-end' }}>

				<p style={{ color: 'white', fontSize: 14, lineHeight: 1.2, textAlign: 'end' }}>
					UNCLAIMED $WIZA
				</p>

				<p style={{ color: 'white', fontSize: 16, marginBottom: 2, lineHeight: 1 }}>
					{_.floor(unclaimedWiza, 4)}
				</p>

				<p style={{ color: '#c2c0c0', fontSize: 12, marginBottom: 2, lineHeight: 1 }}>
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
		const { item, history, width, stakeInfo, loading } = this.props
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
					style={{ width, height: width, borderTopLeftRadius: 2, borderTopRightRadius: 2 }}
					src={getImageUrl(item.id)}
					alt={`#${item.id}`}
				/>

                <div style={{ width, marginTop: 5 }}>
                    <p style={{ color: 'white', minHeight: 34, fontSize: 17, lineHeight: 1, marginLeft: 10, marginRight: 10 }}>
                        {item.nickname ? `${item.name} ${item.nickname}` : item.name}
                    </p>
                </div>

				<div style={{ justifyContent: 'space-between', width, height: 60, alignItems: 'center' }}>

					<div style={{ width: '100%', flexDirection: 'column', justifyContent: 'center' }}>

                        {
                            item.medals &&
                            <div style={{ alignItems: 'center', marginLeft: 10 }}>

                                <IoMedalOutline
                                    color="white"
                                    size={18}
                                    style={{ marginRight: 8 }}
                                />

                                <p style={{ color: 'white', fontSize: 19, marginTop: 3, lineHeight: 1 }}>
                                    {this.calcMedals()}
                                </p>
                            </div>
                        }

                        {
                            level &&
                            <div style={{ alignItems: 'center', marginLeft: 10 }}>
                                <p style={{ color: '#c2c0c0', fontSize: 15, marginRight: 7 }}>
                                    LEVEL
                                </p>
                                <p style={{ color: getColorTextBasedOnLevel(level), fontSize: 18 }}>
                                    {level}
                                </p>
                            </div>
                        }
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
						<DotLoader size={25} color='white' />
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
						<p style={{ fontSize: 17, color: 'white' }}>
							DELIST
						</p>
					</button>
                }

                {
                    !item.medals &&
                    <div style={{ height: 50 }} />
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
                            <p style={{ fontSize: 17, color: 'white' }}>
                                STAKE
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
    						<p style={{ fontSize: 17, color: 'white' }}>
    							BURN
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
						<p style={{ fontSize: 16, color: 'white' }}>
							REMOVE FROM BURNING QUEUE
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
                            <p style={{ fontSize: 17, color: 'white' }}>
                                CLAIM
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
    						<p style={{ fontSize: 17, color: 'white' }}>
    							CLAIM & UNSTAKE
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
		height: 50,
		backgroundColor: CTA_COLOR
	}
}

const mapStateToProps = (state) => {
	const { account, chainId, netId, gasPrice, gasLimit, networkUrl } = state.mainReducer

	return { account, chainId, netId, gasPrice, gasLimit, networkUrl }
}

export default connect(mapStateToProps, {
    getInfoNftBurning,
    selectWizard
})(NftCardStake);
