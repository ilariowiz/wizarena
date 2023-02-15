import React, { Component } from 'react';
import { connect } from 'react-redux'
import DotLoader from 'react-spinners/DotLoader';
import EquipmentCard from './EquipmentCard'
import '../../css/Modal.css'
import '../../css/ItemCard.css'
import { TEXT_SECONDARY_COLOR, BACKGROUND_COLOR, CTA_COLOR } from '../../actions/types'
import {
    loadEquipMinted
} from '../../actions'


const chest_img = require('../../assets/chest.png')


class ModalOpenItemsMinted extends Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: true,
            lastMinted: [],
            opened: []
        }
    }

    componentDidMount() {
        this.loadEquip()
    }

    loadEquip() {
        const { account, chainId, gasPrice, gasLimit, networkUrl, amountMinted } = this.props

        if (account && account.account) {

			this.props.loadEquipMinted(chainId, gasPrice, gasLimit, networkUrl, account, (response) => {
                //console.log(response);

                let final = []

                final = response.filter(i => parseInt(i.id) < 100000)

                final = final.sort((a, b) => {
                    return parseInt(b.id) - parseInt(a.id)
                })

                final = final.slice(0, amountMinted)

                this.setState({ loading: false, lastMinted: final })
			})
		}
    }

    renderSingleChest(item, index) {
        const { opened } = this.state

        if (opened.includes(item.id)) {
            return (
                <EquipmentCard
                    item={item}
                    key={index}
                    index={index}
                    history={this.props.history}
                />
            )
        }

        return (
            <div
                className='containerItem'
                key={index}
                style={{ justifyContent: 'center', alignItems: 'center', marginLeft: 12 }}
            >
                <img
                    src={chest_img}
                    style={{ width: 80, marginBottom: 20 }}
                />

                <button
                    className='btnH'
                    style={Object.assign({}, styles.btnChoose, { height: 30, width: 100, marginBottom: 5 })}
                    onClick={() => {
                        const old = Object.assign([], this.state.opened)
                        old.push(item.id)
                        this.setState({ opened: old })
                    }}
                >
                    <p style={{ fontSize: 17, color: 'white' }}>
                        OPEN
                    </p>
                </button>
            </div>
        )
    }

	render() {
		const { showModal, winner } = this.props;
        const { lastMinted, loading } = this.state

		const classContainer = showModal ? "containerPopup" : "hidePopup"

        const maxHeight = window.innerHeight * 80 / 100
        const width = window.innerWidth * 80 / 100

		return (
			<div className={classContainer}>
				<div style={Object.assign({}, styles.subcontainer, { width, maxHeight })}>

					<p style={{ color: 'white', fontSize: 22, marginBottom: 20, marginTop: 20 }}>
						Open the freshly minted chests:
					</p>

                    {
    					loading ?
    					<div style={{ width: '100%', height: 45, marginTop: 20, marginBottom: 20, justifyContent: 'center', alignItems: 'center' }}>
    						<DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
    					</div>
    					: null
    				}

                    <div style={{ flexWrap: 'wrap', marginBottom: 20, maxHeight, overflow: 'scroll' }}>
                        {lastMinted.map((item, index) => {
                            return this.renderSingleChest(item, index)
                        })}
                    </div>

                    <button
                        className='btnH'
                        style={styles.btnChoose}
                        onClick={() => {
                            this.props.onCloseModal()
                        }}
                    >
                        <p style={{ fontSize: 17, color: 'white' }}>
                            CLOSE
                        </p>
                    </button>

				</div>
			</div>
		)
	}
}


const styles = {
	subcontainer: {
		backgroundColor: BACKGROUND_COLOR,
		borderRadius: 2,
		borderColor: TEXT_SECONDARY_COLOR,
		borderStyle: 'solid',
		borderWidth: 2,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column',
		position: 'relative',
        paddingLeft: 15,
        paddingRight: 15
	},
    btnChoose: {
        minHeight: 40,
        height: 40,
        width: 150,
        minWidth: 100,
        marginBottom: 15,
        borderRadius: 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: CTA_COLOR
    },
}

const mapStateToProps = (state) => {
    const { account, chainId, gasPrice, gasLimit, networkUrl } = state.mainReducer

    return { account, chainId, gasPrice, gasLimit, networkUrl }
}

export default connect(mapStateToProps, {
    loadEquipMinted
})(ModalOpenItemsMinted);
