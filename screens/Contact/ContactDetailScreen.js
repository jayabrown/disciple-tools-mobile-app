import React from 'react';
import { connect } from 'react-redux';
import {
  ScrollView,
  Text,
  Keyboard,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
  TextInput,
  AsyncStorage,
  RefreshControl,
} from 'react-native';

import PropTypes from 'prop-types';

import {
  Container,
  Content,
  Footer,
  FooterTab,
  Label,
  Input,
  Icon,
  Picker,
  Tabs,
  Tab,
  ScrollableTab,
  DatePicker,
  Fab,
  Button,
} from 'native-base';
import Toast from 'react-native-easy-toast';
import { Col, Row, Grid } from 'react-native-easy-grid';
import KeyboardAccessory from 'react-native-sticky-keyboard-accessory';
import ProgressBarAnimated from 'react-native-progress-bar-animated';
import ModalFilterPicker from 'react-native-modal-filter-picker';
import { Chip, Selectize } from 'react-native-material-selectize';

import KeyboardShift from '../../components/KeyboardShift';
import {
  save,
  getCommentsByContact,
  saveComment,
  getById,
  getActivitiesByContact,
} from '../../store/actions/contacts.actions';
import Colors from '../../constants/Colors';
import hasBibleIcon from '../../assets/icons/book-bookmark.png';
import readingBibleIcon from '../../assets/icons/word.png';
import statesBeliefIcon from '../../assets/icons/language.png';
import canShareGospelIcon from '../../assets/icons/b-chat.png';
import sharingTheGospelIcon from '../../assets/icons/evangelism.png';
import baptizedIcon from '../../assets/icons/baptism.png';
import baptizingIcon from '../../assets/icons/water-aerobics.png';
import inChurchIcon from '../../assets/icons/multiple-11.png';
import startingChurchesIcon from '../../assets/icons/symbol-213-7.png';

import i18n from '../../languages';

let toastSuccess;
let toastError;
const containerPadding = 35;
const windowWidth = Dimensions.get('window').width;
const progressBarWidth = windowWidth - 100;
const milestonesGridSize = windowWidth + 5;
/* eslint-disable */
let commentsFlatList,
  subAssignedSelectizeRef,
  geonamesSelectizeRef,
  peopleGroupsSelectizeRef,
  sourcesSelectizeRef,
  groupsSelectizeRef,
  connectionsSelectizeRef,
  baptizedBySelectizeRef,
  coachedSelectizeRef,
  baptizedSelectizeRef,
  coachingSelectizeRef;
/* eslint-enable */
const styles = StyleSheet.create({
  tabBarUnderlineStyle: {
    borderBottomWidth: 3,
    borderBottomColor: Colors.tintColor,
  },
  tabStyle: { backgroundColor: '#FFFFFF' },
  textStyle: { color: 'gray' },
  activeTabStyle: { backgroundColor: '#FFFFFF' },
  activeTextStyle: { color: Colors.tintColor, fontWeight: 'bold' },
  addRemoveIcons: {
    fontSize: 30,
    marginRight: 0,
  },
  icon: {
    color: Colors.tintColor,
  },
  // Form
  formContainer: {
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: containerPadding,
    paddingRight: containerPadding,
  },
  formRow: {
    paddingTop: 20,
    paddingBottom: 20,
    width: '100%',
  },
  formIconLabel: {
    width: 'auto',
  },
  formIcon: {
    color: Colors.tintColor,
    fontSize: 25,
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  formParentLabel: {
    width: 'auto',
  },
  formLabel: {
    color: Colors.tintColor,
    fontSize: 12,
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  formDivider: {
    borderBottomColor: '#CCCCCC',
    borderBottomWidth: 1,
    marginLeft: 10,
    marginRight: 10,
  },
  formIconLabelCol: {
    width: 35,
  },
  formIconLabelView: {
    alignItems: 'center',
  },
  formFieldPadding: {
    paddingTop: 30,
  },
  // Progress Section
  progressIcon: { height: '100%', width: '100%' },
  progressIconActive: {
    opacity: 1,
  },
  progressIconInactive: {
    opacity: 0.15,
  },
  progressIconText: {
    fontSize: 9,
    textAlign: 'center',
    width: '100%',
  },
  // Comments Section
  name: {
    color: Colors.tintColor,
    fontSize: 13,
    fontWeight: 'bold',
  },
  time: {
    color: Colors.tintColor,
    fontSize: 10,
  },
  inputContactAddress: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#D9D5DC',
    marginRight: 10,
    marginBottom: 5,
  },
  saveButton: {
    backgroundColor: Colors.tintColor,
    borderRadius: 5,
    marginTop: 40,
  },
});

class ContactDetailScreen extends React.Component {
  static navigationOptions = ({ navigation }) => {
    const { params } = navigation.state;
    let navigationTitle = i18n.t('contactDetailScreen.addNewContact');

    if (params) {
      if (params.contactName) {
        navigationTitle = params.contactName;
      }
    }

    return {
      title: navigationTitle,
      headerLeft: (
        <Icon
          android="md-arrow-back"
          ios="ios-arrow-back"
          onPress={() => navigation.goBack()}
          style={[{ paddingLeft: 16, color: '#FFFFFF' }]}
        />
      ),
      headerStyle: {
        backgroundColor: Colors.tintColor,
      },
      headerTintColor: '#FFFFFF',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    };
  };

  state = {
    contact: {
      sources: {
        values: [
          {
            value: 'personal',
          },
        ],
      },
      milestones: {
        values: [],
      },
      contact_phone: [],
      contact_email: [],
      contact_address: [],
      geonames: {
        values: [],
      },
      subassigned: {
        values: [],
      },
      people_groups: {
        values: [],
      },
      groups: {
        values: [],
      },
      relation: {
        values: [],
      },
      baptized_by: {
        values: [],
      },
      baptized: {
        values: [],
      },
      coached_by: {
        values: [],
      },
      coaching: {
        values: [],
      },
    },
    contactSources: [
      {
        name: i18n.t('contactDetailScreen.contactSources.personal'),
        value: 'personal',
      },
      {
        name: i18n.t('contactDetailScreen.contactSources.web'),
        value: 'web',
      },
      {
        name: i18n.t('contactDetailScreen.contactSources.phone'),
        value: 'phone',
      },
      {
        name: i18n.t('contactDetailScreen.contactSources.facebook'),
        value: 'facebook',
      },
      {
        name: i18n.t('contactDetailScreen.contactSources.twitter'),
        value: 'twitter',
      },
      {
        name: i18n.t('contactDetailScreen.contactSources.linkedin'),
        value: 'linkedin',
      },
      {
        name: i18n.t('contactDetailScreen.contactSources.referral'),
        value: 'referral',
      },
      {
        name: i18n.t('contactDetailScreen.contactSources.advertisement'),
        value: 'advertisement',
      },
      {
        name: i18n.t('contactDetailScreen.contactSources.transfer'),
        value: 'transfer',
      },
    ],
    users: [],
    usersContacts: [],
    groups: [],
    peopleGroups: [],
    geonames: [],
    loadedLocal: false,
    comments: [],
    loadComments: false,
    loadingMoreComments: false,
    totalComments: 0,
    commentsOffset: 0,
    commentsLimit: 10,
    activities: [],
    loadActivities: false,
    loadingMoreActivities: false,
    totalActivities: 0,
    activitiesOffset: 0,
    activitiesLimit: 10,
    comment: '',
    progressBarValue: 0,
    overallStatusBackgroundColor: '#ffffff',
    listContactStates: [
      {
        label: i18n.t('global.contactOverallStatus.new'),
        value: 'new',
      },
      {
        label: i18n.t('global.contactOverallStatus.unassignable'),
        value: 'unassignable',
      },
      {
        label: i18n.t('global.contactOverallStatus.unassigned'),
        value: 'unassigned',
      },
      {
        label: i18n.t('global.contactOverallStatus.assigned'),
        value: 'assigned',
      },
      {
        label: i18n.t('global.contactOverallStatus.active'),
        value: 'active',
      },
      {
        label: i18n.t('global.contactOverallStatus.paused'),
        value: 'paused',
      },
      {
        label: i18n.t('global.contactOverallStatus.closed'),
        value: 'closed',
      },
    ],
    activeFab: false,
    renderFab: true,
    showAssignedToModal: false,
    loading: false,
    currentTabIndex: 0,
  };

  componentDidMount() {
    const onlyView = this.props.navigation.getParam('onlyView');
    const contactId = this.props.navigation.getParam('contactId');
    const contactName = this.props.navigation.getParam('contactName');
    this.props.navigation.setParams({ hideTabBar: true });
    if (contactId) {
      this.setState(prevState => ({
        contact: {
          ...prevState.contact,
          ID: contactId,
        },
      }));
      this.props.navigation.setParams({ contactName });
    }
    if (onlyView) {
      this.setState({
        onlyView,
      });
    }
    this.getLists();
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      contact,
      loading,
      comments,
      totalComments,
      loadingComments,
      activities,
      totalActivities,
      loadingActivities,
      newComment,
    } = nextProps;
    let newState = {
      ...prevState,
      contact: contact || prevState.contact,
      loading,
      comments: comments || prevState.comments,
      totalComments: totalComments || prevState.totalComments,
      loadComments: loadingComments,
      activities: activities || prevState.activities,
      totalActivities: totalActivities || prevState.totalActivities,
      loadActivities: loadingActivities,
    };

    // NEW COMMENT
    if (newComment) {
      newState.comments.unshift(newComment);
      newState = {
        ...newState,
        comments: newState.comments,
      };
    }

    // GET BY ID
    if (contact) {
      // Update contact status select color
      let newColor = '';
      if (contact.overall_status === 'new' || contact.overall_status === 'unassigned' || contact.overall_status === 'closed') {
        newColor = '#d9534f';
      } else if (
        contact.overall_status === 'unassignable'
        || contact.overall_status === 'assigned'
        || contact.overall_status === 'paused'
      ) {
        newColor = '#f0ad4e';
      } else if (contact.overall_status === 'active') {
        newColor = '#5cb85c';
      }
      newState = {
        ...newState,
        overallStatusBackgroundColor: newColor,
      };
    }

    // GET COMMENTS
    if (comments) {
      // NEW COMMENTS (PAGINATION)
      if (prevState.commentsOffset > 0) {
        newState = {
          ...newState,
          comments: prevState.comments.concat(comments),
          loadingMoreComments: false,
        };
      }
      newState = {
        // UPDATE OFFSET
        ...newState,
        commentsOffset: prevState.commentsOffset + prevState.commentsLimit,
      };
    }

    // GET ACTIVITITES
    if (activities) {
      // NEW ACTIVITIES (PAGINATION)
      if (prevState.activitiesOffset > 0) {
        newState = {
          ...newState,
          activities: prevState.activities.concat(activities),
          loadingMoreActivities: false,
        };
      }
      newState = {
        // UPDATE OFFSET
        ...newState,
        activitiesOffset: prevState.activitiesOffset + prevState.activitiesLimit,
      };
    }

    return newState;
  }

  componentDidUpdate(prevProps) {
    const {
      userReducerError, contact, navigation, newComment, contactsReducerError, saved,
    } = this.props;

    // NEW COMMENT
    if (newComment && prevProps.newComment !== newComment) {
      commentsFlatList.scrollToOffset({ animated: true, offset: 0 });
      this.setComment('');
    }

    // CONTACT SAVE / GET BY ID
    if (contact && prevProps.contact !== contact) {
      // Highlight Updates -> Compare prevState.contact with contact and show differences
      navigation.setParams({ contactName: contact.title });
      if (contact.seeker_path) {
        this.setContactSeekerPath(contact.seeker_path);
      }
    }

    // CONTACT SAVE
    if (saved) {
      this.onRefreshCommentsActivities(contact.ID);
      toastSuccess.show(
        <View>
          <Text style={{ color: '#FFFFFF' }}>{i18n.t('global.success.save')}</Text>
        </View>,
        3000,
      );
      this.onDisableEdit();
    }

    // ERROR
    const usersError = (prevProps.userReducerError !== userReducerError && userReducerError);
    let contactsError = (prevProps.contactsReducerError !== contactsReducerError);
    contactsError = (contactsError && contactsReducerError);
    if (usersError || contactsError) {
      const error = userReducerError || contactsReducerError;
      toastError.show(
        <View>
          <Text style={{ fontWeight: 'bold' }}>{i18n.t('global.error.code')}</Text>
          <Text>{error.code}</Text>
          <Text style={{ fontWeight: 'bold' }}>{i18n.t('global.error.message')}</Text>
          <Text>{error.message}</Text>
        </View>,
        3000,
      );
    }
  }

  onRefresh(contactId) {
    this.getContactById(contactId);
    this.onRefreshCommentsActivities(contactId);
  }

  onRefreshCommentsActivities(contactId) {
    this.setState({
      comments: [],
      activities: [],
      commentsOffset: 0,
      activitiesOffset: 0,
    }, () => {
      this.getContactComments(contactId);
      this.getContactActivities(contactId);
    });
  }

  getLists = async () => {
    let newState = {};
    const users = await AsyncStorage.getItem('usersList');
    if (users !== null) {
      newState = {
        ...newState,
        users: JSON.parse(users).map(user => ({
          key: user.ID,
          label: user.name,
        })),
      };
    }

    const usersContacts = await AsyncStorage.getItem('usersAndContactsList');
    if (usersContacts !== null) {
      newState = {
        ...newState,
        usersContacts: JSON.parse(usersContacts),
      };
    }

    const peopleGroups = await AsyncStorage.getItem('peopleGroupsList');
    if (peopleGroups !== null) {
      newState = {
        ...newState,
        peopleGroups: JSON.parse(peopleGroups),
      };
    }

    const geonames = await AsyncStorage.getItem('locationsList');
    if (geonames !== null) {
      newState = {
        ...newState,
        geonames: JSON.parse(geonames),
      };
    }

    const groups = await AsyncStorage.getItem('searchGroupsList');
    if (groups !== null) {
      newState = {
        ...newState,
        groups: JSON.parse(groups),
      };
    }

    newState = {
      ...newState,
      loadedLocal: true,
    };

    this.setState(newState, () => {
      if (this.state.contact.ID) {
        this.onRefresh(this.state.contact.ID);
      }
    });
  };

  getContactById(contactId) {
    this.props.getById(
      this.props.userData.domain,
      this.props.userData.token,
      contactId,
    );
  }

  getContactComments(contactId) {
    this.props.getComments(
      this.props.userData.domain,
      this.props.userData.token,
      contactId,
      this.state.commentsOffset,
      this.state.commentsLimit,
    );
  }

  getContactActivities(contactId) {
    this.props.getActivities(
      this.props.userData.domain,
      this.props.userData.token,
      contactId,
      this.state.activitiesOffset,
      this.state.activitiesLimit,
    );
  }

  onEnableEdit = () => {
    this.setState({
      onlyView: false,
    });
    this.props.navigation.setParams({ hideTabBar: true });
  };

  onDisableEdit = () => {
    this.setState({
      onlyView: true,
    });
    this.props.navigation.setParams({ hideTabBar: true });
  }

  setContactTitle = (value) => {
    this.setState(prevState => ({
      contact: {
        ...prevState.contact,
        title: value,
      },
    }));
  };

  setSingleContactPhone = (value) => {
    this.setState(prevState => ({
      contact: {
        ...prevState.contact,
        contact_phone: [
          {
            value,
          },
        ],
      },
    }));
  };

  setContactEmail = (value) => {
    this.setState(prevState => ({
      contact: {
        ...prevState.contact,
        contact_email: [
          {
            value,
          },
        ],
      },
    }));
  };

  setContactSource = (value) => {
    this.setState(prevState => ({
      contact: {
        ...prevState.contact,
        sources: {
          values: [
            {
              value,
            },
          ],
        },
      },
    }));
  };

  setGeonames = () => {
    const dbGeonames = [...this.state.contact.geonames.values];

    const localGeonames = [];
    const selectedValues = geonamesSelectizeRef.getSelectedItems();
    Object.keys(selectedValues.entities.item).forEach((itemValue) => {
      const geoname = selectedValues.entities.item[itemValue];
      localGeonames.push(geoname);
    });

    const geonamesToSave = localGeonames.filter((localGeoname) => {
      const foundLocalInDatabase = dbGeonames.find(dbGeoname => dbGeoname.value === localGeoname.value);
      return foundLocalInDatabase === undefined;
    }).map(geoname => ({ value: geoname.value }));

    dbGeonames.forEach((dbGeoname) => {
      const foundDatabaseInLocal = localGeonames.find(localGeoname => dbGeoname.value === localGeoname.value);
      if (!foundDatabaseInLocal) {
        geonamesToSave.push({ value: dbGeoname.value, delete: true });
      }
    });

    return geonamesToSave;
  };

  setContactInitialComment = (value) => {
    this.setState(prevState => ({
      contact: {
        ...prevState.contact,
        initial_comment: value,
      },
    }));
  };

  setContactStatus = (value) => {
    let newColor = '';

    if (value === 'new' || value === 'unassigned' || value === 'closed') {
      newColor = '#d9534f';
    } else if (
      value === 'unassignable'
      || value === 'assigned'
      || value === 'paused'
    ) {
      newColor = '#f0ad4e';
    } else if (value === 'active') {
      newColor = '#5cb85c';
    }

    this.setState(prevState => ({
      contact: {
        ...prevState.contact,
        overall_status: value,
      },
      overallStatusBackgroundColor: newColor,
    }));
  };

  setContactSeekerPath = (value) => {
    let newProgressValue = 100 / 6;

    switch (value) {
      case 'none':
        newProgressValue *= 0;
        break;
      case 'attempted':
        newProgressValue *= 1;
        break;
      case 'established':
        newProgressValue *= 2;
        break;
      case 'scheduled':
        newProgressValue *= 3;
        break;
      case 'met':
        newProgressValue *= 4;
        break;
      case 'ongoing':
        newProgressValue *= 5;
        break;
      case 'coaching':
        newProgressValue *= 6;
        break;
      default:
        break;
    }
    this.setState(prevState => ({
      contact: {
        ...prevState.contact,
        seeker_path: value,
      },
      progressBarValue: newProgressValue,
    }));
  };

  setBaptismDate = (value) => {
    this.setState(prevState => ({
      contact: {
        ...prevState.contact,
        baptism_date: value,
      },
    }));
  };

  onSaveContact = (quickAction = {}) => {
    Keyboard.dismiss();
    let contactToSave = {
      ID: this.state.contact.ID,
    };
    if (
      Object.prototype.hasOwnProperty.call(
        quickAction,
        'quick_button_no_answer',
      )
      || Object.prototype.hasOwnProperty.call(
        quickAction,
        'quick_button_contact_established',
      )
      || Object.prototype.hasOwnProperty.call(
        quickAction,
        'quick_button_meeting_scheduled',
      )
      || Object.prototype.hasOwnProperty.call(
        quickAction,
        'quick_button_meeting_complete',
      )
      || Object.prototype.hasOwnProperty.call(
        quickAction,
        'quick_button_no_show',
      )
    ) {
      contactToSave = {
        ...contactToSave,
        ...quickAction,
      };
    } else {
      contactToSave = JSON.parse(JSON.stringify(this.state.contact));
      if (Object.prototype.hasOwnProperty.call(contactToSave, 'geonames') && geonamesSelectizeRef) {
        contactToSave.geonames.values = this.setGeonames();
      }
      if (Object.prototype.hasOwnProperty.call(contactToSave, 'subassigned') && subAssignedSelectizeRef) {
        contactToSave.subassigned.values = this.setContactSubassignedContacts();
      }
      if (Object.prototype.hasOwnProperty.call(contactToSave, 'groups') && groupsSelectizeRef) {
        contactToSave.groups.values = this.setGroups();
      }
      if (Object.prototype.hasOwnProperty.call(contactToSave, 'relation') && connectionsSelectizeRef) {
        contactToSave.relation.values = this.setConnections();
      }
      if (Object.prototype.hasOwnProperty.call(contactToSave, 'baptized_by') && baptizedBySelectizeRef) {
        contactToSave.baptized_by.values = this.setBaptizedBy();
      }
      if (Object.prototype.hasOwnProperty.call(contactToSave, 'baptized') && baptizedSelectizeRef) {
        contactToSave.baptized.values = this.setBaptized();
      }
      if (Object.prototype.hasOwnProperty.call(contactToSave, 'coached_by') && coachedSelectizeRef) {
        contactToSave.coached_by.values = this.setCoachedBy();
      }
      if (Object.prototype.hasOwnProperty.call(contactToSave, 'coaching') && coachingSelectizeRef) {
        contactToSave.coaching.values = this.setCoaching();
      }
      if (Object.prototype.hasOwnProperty.call(contactToSave, 'people_groups') && peopleGroupsSelectizeRef) {
        contactToSave.people_groups.values = this.setPeopleGroups();
      }
      if (Object.prototype.hasOwnProperty.call(contactToSave, 'sources') && sourcesSelectizeRef) {
        contactToSave.sources.values = this.setSources();
      }
    }

    this.props.saveContact(
      this.props.userData.domain,
      this.props.userData.token,
      contactToSave,
    );
  };

  onFormatDateToView = (date) => {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const newDate = new Date(date);
    let hours = newDate.getHours();
    let minutes = newDate.getMinutes();
    const age = newDate.getFullYear();
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours %= 12;
    hours = hours || 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? `0${minutes}` : minutes;
    const strTime = `${hours}:${minutes} ${ampm}`;
    return `${monthNames[newDate.getMonth()]} ${newDate.getDate()}, ${age} ${strTime}`;
  };

  setComment = (value) => {
    this.setState({
      comment: value,
    });
  };

  onSaveComment = () => {
    const { comment } = this.state;
    if (comment.length > 0) {
      Keyboard.dismiss();
      this.props.saveComment(
        this.props.userData.domain,
        this.props.userData.token,
        this.state.contact.ID,
        {
          comment,
        },
      );
    }
  };

  onCheckExistingMilestone = (milestoneName) => {
    const milestones = this.state.contact.milestones.values;
    const foundMilestone = milestones.some(
      milestone => milestone.value === milestoneName,
    );
    return foundMilestone;
  };

  onMilestoneChange = (milestoneName) => {
    const milestones2 = this.state.contact.milestones.values;
    const foundMilestone = milestones2.find(
      milestone => milestone.value === milestoneName,
    );
    if (foundMilestone) {
      const milestoneIndex = milestones2.indexOf(foundMilestone);
      milestones2.splice(milestoneIndex, 1);
    } else {
      milestones2.push({
        value: milestoneName,
      });
    }
    this.setState(prevState => ({
      contact: {
        ...prevState.contact,
        milestones: {
          values: milestones2,
        },
      },
    }));
  };

  setGroups = () => {
    const dataBaseGroups = [...this.state.contact.groups.values];

    const localGroups = [];
    const selectedValues = groupsSelectizeRef.getSelectedItems();
    Object.keys(selectedValues.entities.item).forEach((itemValue) => {
      const group = selectedValues.entities.item[itemValue];
      localGroups.push(group);
    });

    const groupsToSave = localGroups.filter((localGroup) => {
      const foundLocalInDatabase = dataBaseGroups.find(dataBaseGroup => dataBaseGroup.value === localGroup.value);
      return foundLocalInDatabase === undefined;
    }).map(group => ({ value: group.value }));

    dataBaseGroups.forEach((dataBaseGroup) => {
      const foundDatabaseInLocal = localGroups.find(localGroup => dataBaseGroup.value === localGroup.value);
      if (!foundDatabaseInLocal) {
        groupsToSave.push({ value: dataBaseGroup.value, delete: true });
      }
    });

    return groupsToSave;
  };

  setConnections = () => {
    const dataBaseConnections = [...this.state.contact.relation.values];

    const localConnections = [];
    const selectedValues = connectionsSelectizeRef.getSelectedItems();
    Object.keys(selectedValues.entities.item).forEach((itemValue) => {
      const connection = selectedValues.entities.item[itemValue];
      localConnections.push(connection);
    });

    const connectionsToSave = localConnections.filter((localConnection) => {
      const foundLocalInDatabase = dataBaseConnections.find(dataBaseConnection => dataBaseConnection.value === localConnection.value);
      return foundLocalInDatabase === undefined;
    }).map(connection => ({ value: connection.value }));

    dataBaseConnections.forEach((dataBaseConnection) => {
      const foundDatabaseInLocal = localConnections.find(localConnection => dataBaseConnection.value === localConnection.value);
      if (!foundDatabaseInLocal) {
        connectionsToSave.push({ value: dataBaseConnection.value, delete: true });
      }
    });

    return connectionsToSave;
  };

  setBaptizedBy = () => {
    const dataBaseBaptizedBy = [...this.state.contact.baptized_by.values];

    const localBaptizedBy = [];
    const selectedValues = baptizedBySelectizeRef.getSelectedItems();
    Object.keys(selectedValues.entities.item).forEach((itemValue) => {
      const baptizedBy = selectedValues.entities.item[itemValue];
      localBaptizedBy.push(baptizedBy);
    });

    const baptizedByToSave = localBaptizedBy.filter((localBaptized) => {
      const foundLocalInDatabase = dataBaseBaptizedBy.find(dataBaseBaptized => dataBaseBaptized.value === localBaptized.value);
      return foundLocalInDatabase === undefined;
    }).map(baptizedBy => ({ value: baptizedBy.value }));

    dataBaseBaptizedBy.forEach((dataBaseBaptized) => {
      const foundDatabaseInLocal = localBaptizedBy.find(localBaptized => dataBaseBaptized.value === localBaptized.value);
      if (!foundDatabaseInLocal) {
        baptizedByToSave.push({ value: dataBaseBaptized.value, delete: true });
      }
    });

    return baptizedByToSave;
  };

  setBaptized = () => {
    const dataBaseBaptizeds = [...this.state.contact.baptized.values];

    const localBaptizeds = [];
    const selectedValues = baptizedSelectizeRef.getSelectedItems();
    Object.keys(selectedValues.entities.item).forEach((itemValue) => {
      const baptized = selectedValues.entities.item[itemValue];
      localBaptizeds.push(baptized);
    });

    const baptizedToSave = localBaptizeds.filter((localBaptized) => {
      const foundLocalInDatabase = dataBaseBaptizeds.find(dataBaseBaptized => dataBaseBaptized.value === localBaptized.value);
      return foundLocalInDatabase === undefined;
    }).map(baptized => ({ value: baptized.value }));

    dataBaseBaptizeds.forEach((dataBaseBaptized) => {
      const foundDatabaseInLocal = localBaptizeds.find(localBaptized => dataBaseBaptized.value === localBaptized.value);
      if (!foundDatabaseInLocal) {
        baptizedToSave.push({ value: dataBaseBaptized.value, delete: true });
      }
    });

    return baptizedToSave;
  };

  setCoachedBy = () => {
    const dataBaseCoachedBy = [...this.state.contact.coached_by.values];

    const localCoachedBy = [];
    const selectedValues = coachedSelectizeRef.getSelectedItems();
    Object.keys(selectedValues.entities.item).forEach((itemValue) => {
      const coached = selectedValues.entities.item[itemValue];
      localCoachedBy.push(coached);
    });

    const coachedToSave = localCoachedBy.filter((localCoached) => {
      const foundLocalInDatabase = dataBaseCoachedBy.find(dataBaseCoached => dataBaseCoached.value === localCoached.value);
      return foundLocalInDatabase === undefined;
    }).map(coached => ({ value: coached.value }));

    dataBaseCoachedBy.forEach((dataBaseCoached) => {
      const foundDatabaseInLocal = localCoachedBy.find(localCoached => dataBaseCoached.value === localCoached.value);
      if (!foundDatabaseInLocal) {
        coachedToSave.push({ value: dataBaseCoached.value, delete: true });
      }
    });

    return coachedToSave;
  };

  setCoaching = () => {
    const dataBaseCoaching = [...this.state.contact.coaching.values];

    const localCoaching = [];
    const selectedValues = coachingSelectizeRef.getSelectedItems();
    Object.keys(selectedValues.entities.item).forEach((itemValue) => {
      const coaching = selectedValues.entities.item[itemValue];
      localCoaching.push(coaching);
    });

    const coachingToSave = localCoaching.filter((localCoach) => {
      const localInDataBase = dataBaseCoaching.find(dataBaseCoach => dataBaseCoach.value === localCoach.value);
      return localInDataBase === undefined;
    }).map(coaching => ({ value: coaching.value }));

    dataBaseCoaching.forEach((dataBaseCoach) => {
      const foundDatabaseInLocal = localCoaching.find(localCoach => dataBaseCoach.value === localCoach.value);
      if (!foundDatabaseInLocal) {
        coachingToSave.push({ value: dataBaseCoach.value, delete: true });
      }
    });

    return coachingToSave;
  };

  setContactAge = (value) => {
    this.setState(prevState => ({
      contact: {
        ...prevState.contact,
        age: value,
      },
    }));
  };

  setContactGender = (value) => {
    this.setState(prevState => ({
      contact: {
        ...prevState.contact,
        gender: value,
      },
    }));
  };

  setToggleFab = () => {
    this.setState(prevState => ({
      activeFab: !prevState.activeFab,
    }));
  };

  getCommentsAndActivities() {
    const { comments, activities } = this.state;
    const list = comments.concat(activities);
    return list.filter((item, index) => list.indexOf(item) === index).sort(
      (a, b) => new Date(a.date).getTime() < new Date(b.date).getTime(),
    );
  }

  renderActivityOrCommentRow = commentOrActivity => (
    <View
      style={{
        paddingLeft: 19,
        paddingRight: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'flex-start',
      }}
    >
      <Image
        style={{
          height: 16,
          marginTop: 10,
          width: 16,
        }}
        source={{ uri: commentOrActivity.gravatar }}
      />
      <View
        style={{
          backgroundColor: '#F3F3F3',
          borderRadius: 5,
          flex: 1,
          marginLeft: 16,
          padding: 10,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 6,
          }}
        >
          {Object.prototype.hasOwnProperty.call(
            commentOrActivity,
            'content',
          ) && (
          <Grid>
            <Row>
              <Col>
                <Text style={styles.name}>{commentOrActivity.author}</Text>
              </Col>
              <Col style={{ width: 110 }}>
                <Text style={styles.time}>
                  {this.onFormatDateToView(commentOrActivity.date)}
                </Text>
              </Col>
            </Row>
          </Grid>
          )}
          {Object.prototype.hasOwnProperty.call(
            commentOrActivity,
            'object_note',
          ) && (
          <Grid>
            <Row>
              <Col>
                <Text style={styles.name}>{commentOrActivity.name}</Text>
              </Col>
              <Col style={{ width: 110 }}>
                <Text style={styles.time}>
                  {this.onFormatDateToView(commentOrActivity.date)}
                </Text>
              </Col>
            </Row>
          </Grid>
          )}
        </View>
        <Text
          style={
            commentOrActivity.content
              ? {
                paddingLeft: 10,
                paddingRight: 10,
              }
              : {
                paddingLeft: 10,
                paddingRight: 10,
                color: '#B4B4B4',
                fontStyle: 'italic',
              }
          }
        >
          {Object.prototype.hasOwnProperty.call(commentOrActivity, 'content')
            ? commentOrActivity.content
            : commentOrActivity.object_note}
        </Text>
      </View>
    </View>
  )

  renderSourcePickerItems = () => this.state.contactSources.map(source => (
    <Picker.Item
      key={source.value}
      label={source.name}
      value={source.value}
    />
  ));

  renderStatusPickerItems = () => this.state.listContactStates.map(status => (
    <Picker.Item
      key={status.value}
      label={status.label}
      value={status.value}
    />
  ));

  tabChanged = (event) => {
    this.props.navigation.setParams({ hideTabBar: event.i === 2 });
    this.setState({
      renderFab: !(event.i === 2),
      currentTabIndex: event.i,
    });
  };

  onAddPhoneField = () => {
    const contactPhones = this.state.contact.contact_phone;
    contactPhones.push({
      value: '',
    });
    this.setState(prevState => ({
      contact: {
        ...prevState.contact,
        contact_phone: contactPhones,
      },
    }));
  };

  onPhoneFieldChange = (value, index, dbIndex, component) => {
    const phoneAddressList = component.state.contact.contact_phone;
    const contactPhone = phoneAddressList[index];
    contactPhone.value = value;
    if (dbIndex) {
      contactPhone.key = dbIndex;
    }
    component.setState(prevState => ({
      contact: {
        ...prevState.contact,
        contact_phone: phoneAddressList,
      },
    }));
  };

  onRemovePhoneField = (index, component) => {
    const contactPhoneList = [...component.state.contact.contact_phone];
    let contactPhone = contactPhoneList[index];
    if (contactPhone.key) {
      contactPhone = {
        key: contactPhone.key,
        delete: true,
      };
      contactPhoneList[index] = contactPhone;
    } else {
      contactPhoneList.splice(index, 1);
    }
    component.setState(prevState => ({
      contact: {
        ...prevState.contact,
        contact_phone: contactPhoneList,
      },
    }));
  };

  onAddEmailField = () => {
    const contactEmails = this.state.contact.contact_email;
    contactEmails.push({
      value: '',
    });
    this.setState(prevState => ({
      contact: {
        ...prevState.contact,
        contact_email: contactEmails,
      },
    }));
  };

  onEmailFieldChange = (value, index, dbIndex, component) => {
    const contactEmailList = component.state.contact.contact_email;
    const contactEmail = contactEmailList[index];
    contactEmail.value = value;
    if (dbIndex) {
      contactEmail.key = dbIndex;
    }
    component.setState(prevState => ({
      ...prevState,
      contact: {
        ...prevState.contact,
        contact_email: contactEmailList,
      },
    }));
  };

  onRemoveEmailField = (index, component) => {
    const contactEmailList = [...component.state.contact.contact_email];
    let contactEmail = contactEmailList[index];
    if (contactEmail.key) {
      contactEmail = {
        key: contactEmail.key,
        delete: true,
      };
      contactEmailList[index] = contactEmail;
    } else {
      contactEmailList.splice(index, 1);
    }
    component.setState(prevState => ({
      contact: {
        ...prevState.contact,
        contact_email: contactEmailList,
      },
    }));
  };

  onAddAddressField = () => {
    const contactAddress = this.state.contact.contact_address;
    contactAddress.push({
      value: '',
    });
    this.setState(prevState => ({
      contact: {
        ...prevState.contact,
        contact_address: contactAddress,
      },
    }));
  };

  onAddressFieldChange = (value, index, dbIndex, component) => {
    const contactAddressList = component.state.contact.contact_address;
    const contactAddress = contactAddressList[index];
    contactAddress.value = value;
    if (dbIndex) {
      contactAddress.key = dbIndex;
    }
    component.setState(prevState => ({
      contact: {
        ...prevState.contact,
        contact_address: contactAddressList,
      },
    }));
  };

  onRemoveAddressField = (index, component) => {
    const contactAddressList = [...component.state.contact.contact_address];
    let contactAddress = contactAddressList[index];
    if (contactAddress.key) {
      contactAddress = {
        key: contactAddress.key,
        delete: true,
      };
      contactAddressList[index] = contactAddress;
    } else {
      contactAddressList.splice(index, 1);
    }
    component.setState(prevState => ({
      contact: {
        ...prevState.contact,
        contact_address: contactAddressList,
      },
    }));
  };

  setPeopleGroups = () => {
    const dataBasePeopleGroups = [...this.state.contact.people_groups.values];

    const localPeopleGroups = [];
    const selectedValues = peopleGroupsSelectizeRef.getSelectedItems();
    Object.keys(selectedValues.entities.item).forEach((itemValue) => {
      const peopleGroup = selectedValues.entities.item[itemValue];
      localPeopleGroups.push(peopleGroup);
    });

    const peopleGroupsToSave = localPeopleGroups.filter((localPeopleGroup) => {
      const foundLocalInDatabase = dataBasePeopleGroups.find(dataBasePeopleGroup => dataBasePeopleGroup.value === localPeopleGroup.value);
      return foundLocalInDatabase === undefined;
    }).map(peopleGroup => ({ value: peopleGroup.value }));

    dataBasePeopleGroups.forEach((dataBasePeopleGroup) => {
      const foundDatabaseInLocal = localPeopleGroups.find(localPeopleGroup => dataBasePeopleGroup.value === localPeopleGroup.value);
      if (!foundDatabaseInLocal) {
        peopleGroupsToSave.push({ value: dataBasePeopleGroup.value, delete: true });
      }
    });

    return peopleGroupsToSave;
  };

  setSources = () => {
    const dataBaseSources = [...this.state.contact.sources.values];

    const localSources = [];
    const selectedValues = sourcesSelectizeRef.getSelectedItems();
    Object.keys(selectedValues.entities.item).forEach((itemValue) => {
      const source = selectedValues.entities.item[itemValue];
      localSources.push(source);
    });

    const sourcesToSave = localSources.filter((localSource) => {
      const foundLocalInDatabase = dataBaseSources.find(dataBaseSource => dataBaseSource.value === localSource.value);
      return foundLocalInDatabase === undefined;
    }).map(source => ({ value: source.value }));

    dataBaseSources.forEach((dataBaseSource) => {
      const foundDatabaseInLocal = localSources.find(localSource => dataBaseSource.value === localSource.value);
      if (!foundDatabaseInLocal) {
        sourcesToSave.push({ value: dataBaseSource.value, delete: true });
      }
    });

    return sourcesToSave;
  };

  updateShowAssignedToModal = (value) => {
    this.setState({
      showAssignedToModal: value,
    });
  };

  onSelectAssignedTo = (key) => {
    this.setState(prevState => ({
      contact: {
        ...prevState.contact,
        assigned_to: `user-${key}`,
      },
      showAssignedToModal: false,
    }));
  };

  onCancelAssignedTo = () => {
    this.setState({
      showAssignedToModal: false,
    });
  };

  showAssignedUser = () => {
    const foundUser = this.state.users.find(
      user => `user-${user.key}` === this.state.contact.assigned_to,
    );
    return <Text style={{ marginTop: 'auto', marginBottom: 'auto', fontSize: 15 }}>{foundUser ? foundUser.label : ''}</Text>;
  };

  setContactSubassignedContacts = () => {
    const dataBaseContacts = [...this.state.contact.subassigned.values];

    const localContacts = [];
    const selectedValues = subAssignedSelectizeRef.getSelectedItems();
    Object.keys(selectedValues.entities.item).forEach((itemValue) => {
      const contact = selectedValues.entities.item[itemValue];
      localContacts.push(contact);
    });

    const subassignedContactToSave = localContacts.filter((localContact) => {
      const foundLocalInDatabase = dataBaseContacts.find(dataBaseContact => dataBaseContact.value === localContact.value);
      return foundLocalInDatabase === undefined;
    }).map(contact => ({ value: contact.value }));

    dataBaseContacts.forEach((dataBaseContact) => {
      const foundDatabaseInLocal = localContacts.find(localContact => dataBaseContact.value === localContact.value);
      if (!foundDatabaseInLocal) {
        subassignedContactToSave.push({ value: dataBaseContact.value, delete: true });
      }
    });

    return subassignedContactToSave;
  };

  renderfaithMilestones() {
    return (
      <Grid
        pointerEvents={this.state.onlyView ? 'none' : 'auto'}
        style={{
          height: milestonesGridSize,
        }}
      >
        <Row size={6}>
          <Col size={1} />
          <Col size={5}>
            <TouchableOpacity
              onPress={() => {
                this.onMilestoneChange('milestone_has_bible');
              }}
              activeOpacity={1}
              style={styles.progressIcon}
            >
              <Col>
                <Row size={3}>
                  <Image
                    source={hasBibleIcon}
                    style={[
                      styles.progressIcon,
                      this.onCheckExistingMilestone(
                        'milestone_has_bible',
                      )
                        ? styles.progressIconActive
                        : styles.progressIconInactive,
                    ]}
                  />
                </Row>
                <Row size={1}>
                  <Text
                    style={[
                      styles.progressIconText,
                      this.onCheckExistingMilestone(
                        'milestone_has_bible',
                      )
                        ? styles.progressIconActive
                        : styles.progressIconInactive,
                    ]}
                  >
                    {i18n.t('contactDetailScreen.milestones.hasBible')}
                  </Text>
                </Row>
              </Col>
            </TouchableOpacity>
          </Col>
          <Col size={1} />
          <Col size={5}>
            <TouchableOpacity
              onPress={() => {
                this.onMilestoneChange(
                  'milestone_reading_bible',
                );
              }}
              activeOpacity={1}
              style={styles.progressIcon}
            >
              <Col>
                <Row size={3}>
                  <Image
                    source={readingBibleIcon}
                    style={[
                      styles.progressIcon,
                      this.onCheckExistingMilestone(
                        'milestone_reading_bible',
                      )
                        ? styles.progressIconActive
                        : styles.progressIconInactive,
                    ]}
                  />
                </Row>
                <Row size={1}>
                  <Text
                    style={[
                      styles.progressIconText,
                      this.onCheckExistingMilestone(
                        'milestone_reading_bible',
                      )
                        ? styles.progressIconActive
                        : styles.progressIconInactive,
                    ]}
                  >
                    {i18n.t('contactDetailScreen.milestones.readingBible')}
                  </Text>
                </Row>
              </Col>
            </TouchableOpacity>
          </Col>
          <Col size={1} />
          <Col size={5}>
            <TouchableOpacity
              onPress={() => {
                this.onMilestoneChange('milestone_belief');
              }}
              activeOpacity={1}
              style={styles.progressIcon}
            >
              <Col>
                <Row size={3}>
                  <Image
                    source={statesBeliefIcon}
                    style={[
                      styles.progressIcon,
                      this.onCheckExistingMilestone(
                        'milestone_belief',
                      )
                        ? styles.progressIconActive
                        : styles.progressIconInactive,
                    ]}
                  />
                </Row>
                <Row size={1}>
                  <Text
                    style={[
                      styles.progressIconText,
                      this.onCheckExistingMilestone(
                        'milestone_belief',
                      )
                        ? styles.progressIconActive
                        : styles.progressIconInactive,
                    ]}
                  >
                    {i18n.t('contactDetailScreen.milestones.statesBelief')}
                  </Text>
                </Row>
              </Col>
            </TouchableOpacity>
          </Col>
          <Col size={1} />
        </Row>
        <Row size={1} />
        <Row size={7}>
          <Col size={1} />
          <Col size={5}>
            <TouchableOpacity
              onPress={() => {
                this.onMilestoneChange('milestone_can_share');
              }}
              activeOpacity={1}
              style={styles.progressIcon}
            >
              <Col>
                <Row size={7}>
                  <Image
                    source={canShareGospelIcon}
                    style={[
                      styles.progressIcon,
                      this.onCheckExistingMilestone(
                        'milestone_can_share',
                      )
                        ? styles.progressIconActive
                        : styles.progressIconInactive,
                    ]}
                  />
                </Row>
                <Row size={3}>
                  <Text
                    style={[
                      styles.progressIconText,
                      this.onCheckExistingMilestone(
                        'milestone_can_share',
                      )
                        ? styles.progressIconActive
                        : styles.progressIconInactive,
                    ]}
                  >
                    {i18n.t('contactDetailScreen.milestones.shareGospel')}
                  </Text>
                </Row>
              </Col>
            </TouchableOpacity>
          </Col>
          <Col size={1} />
          <Col size={5}>
            <TouchableOpacity
              onPress={() => {
                this.onMilestoneChange('milestone_sharing');
              }}
              activeOpacity={1}
              style={styles.progressIcon}
            >
              <Col>
                <Row size={7}>
                  <Image
                    source={sharingTheGospelIcon}
                    style={[
                      styles.progressIcon,
                      this.onCheckExistingMilestone(
                        'milestone_sharing',
                      )
                        ? styles.progressIconActive
                        : styles.progressIconInactive,
                    ]}
                  />
                </Row>
                <Row size={3}>
                  <Text
                    style={[
                      styles.progressIconText,
                      this.onCheckExistingMilestone(
                        'milestone_sharing',
                      )
                        ? styles.progressIconActive
                        : styles.progressIconInactive,
                    ]}
                  >
                    {i18n.t('contactDetailScreen.milestones.sharingGospel')}
                  </Text>
                </Row>
              </Col>
            </TouchableOpacity>
          </Col>
          <Col size={1} />
          <Col size={5}>
            <TouchableOpacity
              onPress={() => {
                this.onMilestoneChange('milestone_baptized');
              }}
              activeOpacity={1}
              style={styles.progressIcon}
            >
              <Col>
                <Row size={7}>
                  <Image
                    source={baptizedIcon}
                    style={[
                      styles.progressIcon,
                      this.onCheckExistingMilestone(
                        'milestone_baptized',
                      )
                        ? styles.progressIconActive
                        : styles.progressIconInactive,
                    ]}
                  />
                </Row>
                <Row size={3}>
                  <Text
                    style={[
                      styles.progressIconText,
                      this.onCheckExistingMilestone(
                        'milestone_baptized',
                      )
                        ? styles.progressIconActive
                        : styles.progressIconInactive,
                    ]}
                  >
                    {i18n.t('contactDetailScreen.milestones.baptized')}
                  </Text>
                </Row>
              </Col>
            </TouchableOpacity>
          </Col>
          <Col size={1} />
        </Row>
        <Row size={1} />
        <Row size={6}>
          <Col size={1} />
          <Col size={5}>
            <TouchableOpacity
              onPress={() => {
                this.onMilestoneChange('milestone_baptizing');
              }}
              activeOpacity={1}
              style={styles.progressIcon}
            >
              <Col>
                <Row size={3}>
                  <Image
                    source={baptizingIcon}
                    style={[
                      styles.progressIcon,
                      this.onCheckExistingMilestone(
                        'milestone_baptizing',
                      )
                        ? styles.progressIconActive
                        : styles.progressIconInactive,
                    ]}
                  />
                </Row>
                <Row size={1}>
                  <Text
                    style={[
                      styles.progressIconText,
                      this.onCheckExistingMilestone(
                        'milestone_baptizing',
                      )
                        ? styles.progressIconActive
                        : styles.progressIconInactive,
                    ]}
                  >
                    {i18n.t('contactDetailScreen.milestones.baptizing')}
                  </Text>
                </Row>
              </Col>
            </TouchableOpacity>
          </Col>
          <Col size={1} />
          <Col size={5}>
            <TouchableOpacity
              onPress={() => {
                this.onMilestoneChange('milestone_in_group');
              }}
              activeOpacity={1}
              style={styles.progressIcon}
            >
              <Col>
                <Row size={3}>
                  <Image
                    source={inChurchIcon}
                    style={[
                      styles.progressIcon,
                      this.onCheckExistingMilestone(
                        'milestone_in_group',
                      )
                        ? styles.progressIconActive
                        : styles.progressIconInactive,
                    ]}
                  />
                </Row>
                <Row size={1}>
                  <Text
                    style={[
                      styles.progressIconText,
                      this.onCheckExistingMilestone(
                        'milestone_in_group',
                      )
                        ? styles.progressIconActive
                        : styles.progressIconInactive,
                    ]}
                  >
                    {i18n.t('contactDetailScreen.milestones.inGroup')}
                  </Text>
                </Row>
              </Col>
            </TouchableOpacity>
          </Col>
          <Col size={1} />
          <Col size={5}>
            <TouchableOpacity
              onPress={() => {
                this.onMilestoneChange('milestone_planting');
              }}
              activeOpacity={1}
              style={styles.progressIcon}
            >
              <Col>
                <Row size={3}>
                  <Image
                    source={startingChurchesIcon}
                    style={[
                      styles.progressIcon,
                      this.onCheckExistingMilestone(
                        'milestone_planting',
                      )
                        ? styles.progressIconActive
                        : styles.progressIconInactive,
                    ]}
                  />
                </Row>
                <Row size={1}>
                  <Text
                    style={[
                      styles.progressIconText,
                      this.onCheckExistingMilestone(
                        'milestone_planting',
                      )
                        ? styles.progressIconActive
                        : styles.progressIconInactive,
                    ]}
                  >
                    {i18n.t('contactDetailScreen.milestones.startingChurches')}
                  </Text>
                </Row>
              </Col>
            </TouchableOpacity>
          </Col>
          <Col size={1} />
        </Row>
      </Grid>
    );
  }

  render() {

    const successToast = (
      <Toast
        ref={(toast) => {
          toastSuccess = toast;
        }}
        style={{ backgroundColor: 'green' }}
        position="center"
      />
    );
    const errorToast = (
      <Toast
        ref={(toast) => {
          toastError = toast;
        }}
        style={{ backgroundColor: Colors.errorBackground }}
        position="center"
      />
    );

    return (
      <View style={{ flex: 1 }}>
        {this.state.loadedLocal && (
          <View style={{ flex: 1 }}>
            {this.state.contact.ID ? (
              <View style={{ flex: 1 }}>
                {this.state.onlyView && (
                  <View style={{ flex: 1 }}>
                    <Tabs
                      renderTabBar={() => <ScrollableTab />}
                      tabBarUnderlineStyle={styles.tabBarUnderlineStyle}
                      onChangeTab={this.tabChanged}
                    >
                      <Tab
                        heading={i18n.t('global.details')}
                        tabStyle={styles.tabStyle}
                        textStyle={styles.textStyle}
                        activeTabStyle={styles.activeTabStyle}
                        activeTextStyle={styles.activeTextStyle}
                      >
                        <ScrollView
                          refreshControl={(
                            <RefreshControl
                              refreshing={this.state.loading}
                              onRefresh={() => this.onRefresh(this.state.contact.ID)}
                            />
                          )}
                        >
                          <Grid style={[styles.formContainer, { marginTop: 10, paddingBottom: 0 }]}>
                            <Row>
                              <Col />
                              <Col>
                                <Text style={{ color: Colors.tintColor, fontSize: 15, textAlign: 'right' }} onPress={() => this.onEnableEdit()}>
                                  {i18n.t('global.edit')}
                                </Text>
                              </Col>
                            </Row>
                          </Grid>
                          <View
                            style={[styles.formContainer, { paddingTop: 0 }]}
                            pointerEvents="none"
                          >
                            <Label
                              style={{
                                color: Colors.tintColor, fontSize: 12, fontWeight: 'bold', marginTop: 10,
                              }}
                            >
                              {i18n.t('global.status')}
                            </Label>
                            <Row style={[styles.formRow, { paddingTop: 5 }]}>
                              <Col>
                                <Picker
                                  selectedValue={
                                    this.state.contact.overall_status
                                  }
                                  onValueChange={this.setContactStatus}
                                  style={{
                                    color: '#ffffff',
                                    backgroundColor: this.state.overallStatusBackgroundColor,
                                  }}
                                >
                                  {this.renderStatusPickerItems()}
                                </Picker>
                              </Col>
                            </Row>
                            <Row style={styles.formRow}>
                              <Col style={[styles.formIconLabel, { marginRight: 10 }]}>
                                <Icon
                                  type="FontAwesome"
                                  name="user-circle"
                                  style={styles.formIcon}
                                />
                              </Col>
                              <Col>
                                {this.showAssignedUser()}
                              </Col>
                              <Col style={styles.formParentLabel}>
                                <Label style={styles.formLabel}>
                                  {i18n.t('global.assignedTo')}
                                </Label>
                              </Col>
                            </Row>
                            <View style={styles.formDivider} />
                            <Row style={styles.formRow}>
                              <Col style={[styles.formIconLabel, { marginRight: 10 }]}>
                                <Icon
                                  type="Ionicons"
                                  name="md-people"
                                  style={styles.formIcon}
                                />
                              </Col>
                              <Col>
                                <Text style={{ marginTop: 'auto', marginBottom: 'auto' }}>{this.state.contact.subassigned.values.map(contact => `${contact.name}, `)}</Text>
                              </Col>
                              <Col style={styles.formParentLabel}>
                                <Label style={styles.formLabel}>
                                  {i18n.t('contactDetailScreen.subAssignedTo')}
                                </Label>
                              </Col>
                            </Row>
                            <View style={styles.formDivider} />
                            <Row style={styles.formRow}>
                              <Col style={[styles.formIconLabel, { marginRight: 10 }]}>
                                <Icon
                                  type="FontAwesome"
                                  name="phone"
                                  style={styles.formIcon}
                                />
                              </Col>
                              <Col>
                                <Text style={{ marginTop: 'auto', marginBottom: 'auto' }}>{this.state.contact.contact_phone.map(phone => `${phone.value}, `)}</Text>
                              </Col>
                              <Col style={styles.formParentLabel}>
                                <Label style={styles.formLabel}>{i18n.t('contactDetailScreen.mobile')}</Label>
                              </Col>
                            </Row>
                            <View style={styles.formDivider} />
                            <Row style={styles.formRow}>
                              <Col style={[styles.formIconLabel, { marginRight: 10 }]}>
                                <Icon
                                  type="FontAwesome"
                                  name="envelope"
                                  style={styles.formIcon}
                                />
                              </Col>
                              <Col>
                                <Text style={{ marginTop: 'auto', marginBottom: 'auto' }}>{this.state.contact.contact_email.map(email => `${email.value}, `)}</Text>
                              </Col>
                              <Col style={styles.formParentLabel}>
                                <Label style={styles.formLabel}>{i18n.t('contactDetailScreen.email')}</Label>
                              </Col>
                            </Row>
                            <View style={styles.formDivider} />
                            <Row style={styles.formRow}>
                              <Col style={[styles.formIconLabel, { marginRight: 10 }]}>
                                <Icon
                                  android="logo-facebook"
                                  ios="logo-facebook"
                                  style={styles.formIcon}
                                />
                              </Col>
                              <Col>
                                <Text style={{ marginTop: 'auto', marginBottom: 'auto' }} />
                              </Col>
                              <Col style={styles.formParentLabel}>
                                <Label style={styles.formLabel}>{i18n.t('contactDetailScreen.message')}</Label>
                              </Col>
                            </Row>
                            <View style={styles.formDivider} />
                            <Row style={styles.formRow}>
                              <Col style={[styles.formIconLabel, { marginRight: 10 }]}>
                                <Icon
                                  type="Entypo"
                                  name="home"
                                  style={styles.formIcon}
                                />
                              </Col>
                              <Col>
                                <Text style={{ marginTop: 'auto', marginBottom: 'auto' }}>{this.state.contact.contact_address.map(address => `${address.value}, `)}</Text>
                              </Col>
                              <Col style={styles.formParentLabel}>
                                <Label style={styles.formLabel}>{i18n.t('global.address')}</Label>
                              </Col>
                            </Row>
                            <View style={styles.formDivider} />
                            <Row style={styles.formRow}>
                              <Col style={[styles.formIconLabel, { marginRight: 10 }]}>
                                <Icon
                                  type="FontAwesome"
                                  name="map-marker"
                                  style={styles.formIcon}
                                />
                              </Col>
                              <Col>
                                <Text style={{ marginTop: 'auto', marginBottom: 'auto' }}>{this.state.contact.geonames.values.map(geoname => `${geoname.name}, `)}</Text>
                              </Col>
                              <Col style={styles.formParentLabel}>
                                <Label style={styles.formLabel}>
                                  {i18n.t('global.location')}
                                </Label>
                              </Col>
                            </Row>
                            <View style={styles.formDivider} />
                            <Row style={styles.formRow}>
                              <Col style={[styles.formIconLabel, { marginRight: 10 }]}>
                                <Icon
                                  type="FontAwesome"
                                  name="globe"
                                  style={styles.formIcon}
                                />
                              </Col>
                              <Col>
                                <Text style={{ marginTop: 'auto', marginBottom: 'auto' }}>{this.state.contact.people_groups.values.map(peopleGroup => `${peopleGroup.name}, `)}</Text>
                              </Col>
                              <Col style={styles.formParentLabel}>
                                <Label style={styles.formLabel}>
                                  {i18n.t('global.peopleGroup')}
                                </Label>
                              </Col>
                            </Row>
                            <View style={styles.formDivider} />
                            <Row style={styles.formRow}>
                              <Col style={[styles.formIconLabel, { marginRight: 10 }]}>
                                <Icon
                                  type="FontAwesome"
                                  name="clock-o"
                                  style={styles.formIcon}
                                />
                              </Col>
                              <Col>
                                <Text style={{ marginTop: 'auto', marginBottom: 'auto' }}>{this.state.contact.age}</Text>
                              </Col>
                              <Col style={styles.formParentLabel}>
                                <Label style={styles.formLabel}>{i18n.t('contactDetailScreen.age')}</Label>
                              </Col>
                            </Row>
                            <View style={styles.formDivider} />
                            <Row style={styles.formRow}>
                              <Col style={[styles.formIconLabel, { marginRight: 10 }]}>
                                <Icon
                                  android="md-male"
                                  ios="ios-male"
                                  style={styles.formIcon}
                                />
                              </Col>
                              <Col>
                                <Text style={{ marginTop: 'auto', marginBottom: 'auto' }}>{(this.state.contact.gender) ? i18n.t(`contactDetailScreen.${this.state.contact.gender}`) : ''}</Text>
                              </Col>
                              <Col style={styles.formParentLabel}>
                                <Label style={styles.formLabel}>{i18n.t('contactDetailScreen.gender')}</Label>
                              </Col>
                            </Row>
                            <View style={styles.formDivider} />
                            <Row style={styles.formRow}>
                              <Col style={[styles.formIconLabel, { marginRight: 10 }]}>
                                <Icon
                                  android="md-arrow-dropright"
                                  ios="ios-arrow-dropright"
                                  style={styles.formIcon}
                                />
                              </Col>
                              <Col>
                                <Text style={{ marginTop: 'auto', marginBottom: 'auto' }}>{this.state.contact.sources.values.map(source => `${source.name}, `)}</Text>
                              </Col>
                              <Col style={styles.formParentLabel}>
                                <Label style={styles.formLabel}>
                                  {i18n.t('contactDetailScreen.source')}
                                </Label>
                              </Col>
                            </Row>
                            <View style={styles.formDivider} />
                          </View>
                        </ScrollView>
                      </Tab>
                      <Tab
                        heading={i18n.t('global.progress')}
                        tabStyle={styles.tabStyle}
                        textStyle={styles.textStyle}
                        activeTabStyle={styles.activeTabStyle}
                        activeTextStyle={styles.activeTextStyle}
                      >
                        <ScrollView
                          refreshControl={(
                            <RefreshControl
                              refreshing={this.state.loading}
                              onRefresh={() => this.onRefresh(this.state.contact.ID)}
                            />
                          )}
                        >
                          <View
                            style={[styles.formContainer, { marginTop: 10 }]}
                          >
                            <Grid>
                              <Row>
                                <Col />
                                <Col>
                                  <Text style={{ color: Colors.tintColor, fontSize: 15, textAlign: 'right' }} onPress={() => this.onEnableEdit()}>
                                    {i18n.t('global.edit')}
                                  </Text>
                                </Col>
                              </Row>
                            </Grid>
                            <Row style={[styles.formRow, { paddingTop: 15 }]}>
                              <Col style={[styles.formIconLabel, { marginRight: 10 }]}>
                                <Icon
                                  android="md-calendar"
                                  ios="ios-calendar"
                                  style={styles.formIcon}
                                />
                              </Col>
                              <Col>
                                <Text style={{ marginTop: 'auto', marginBottom: 'auto' }}>{i18n.t(`global.seekerPath.${this.state.contact.seeker_path}`)}</Text>
                              </Col>
                              <Col style={styles.formParentLabel}>
                                <Label style={styles.formLabel}>{i18n.t('contactDetailScreen.seekerPath')}</Label>
                              </Col>
                            </Row>
                            <View
                              style={{
                                alignItems: 'center',
                                marginTop: 5,
                                marginBottom: 25,
                              }}
                            >
                              <ProgressBarAnimated
                                width={progressBarWidth}
                                value={this.state.progressBarValue}
                                backgroundColor={Colors.tintColor}
                              />
                            </View>
                            <View style={styles.formDivider} />
                            <Label
                              style={[
                                styles.formLabel,
                                { fontWeight: 'bold', marginBottom: 10, marginTop: 20 },
                              ]}
                            >
                              {i18n.t('contactDetailScreen.faithMilestones')}
                            </Label>
                            {this.renderfaithMilestones()}
                            <Grid style={{ marginTop: 25 }}>
                              <View style={styles.formDivider} />
                              <Row style={styles.formRow}>
                                <Col style={[styles.formIconLabel, { marginRight: 10 }]}>
                                  <Icon
                                    type="Entypo"
                                    name="water"
                                    style={styles.formIcon}
                                  />
                                </Col>
                                <Col>
                                  <Text style={{ marginTop: 'auto', marginBottom: 'auto' }}>{this.state.contact.baptism_date}</Text>
                                </Col>
                                <Col style={styles.formIconLabel}>
                                  <Label style={[styles.label, styles.formLabel]}>
                                    {i18n.t('contactDetailScreen.milestones.baptismDate')}
                                  </Label>
                                </Col>
                              </Row>
                            </Grid>
                          </View>
                        </ScrollView>
                      </Tab>
                      <Tab
                        heading={i18n.t('global.commentsActivity')}
                        tabStyle={styles.tabStyle}
                        textStyle={styles.textStyle}
                        activeTabStyle={styles.activeTabStyle}
                        activeTextStyle={styles.activeTextStyle}
                      >
                        <View style={{ flex: 1 }}>
                          <FlatList
                            style={{
                              backgroundColor: '#ffffff',
                              flex: 1,
                              marginBottom: 60,
                            }}
                            ref={(flatList) => {
                              commentsFlatList = flatList;
                            }}
                            data={this.getCommentsAndActivities()}
                            extraData={!this.state.loadingMoreComments || !this.state.loadingMoreActivities}
                            inverted
                            ItemSeparatorComponent={() => (
                              <View
                                style={{
                                  height: 1,
                                  backgroundColor: '#CCCCCC',
                                }}
                              />
                            )}
                            keyExtractor={(item, index) => String(index)}
                            renderItem={(item) => {
                              const commentOrActivity = item.item;
                              return this.renderActivityOrCommentRow(
                                commentOrActivity,
                              );
                            }}
                            refreshControl={(
                              <RefreshControl
                                refreshing={(this.state.loadComments || this.state.loadActivities)}
                                onRefresh={() => this.onRefreshCommentsActivities(this.state.contact.ID)}
                              />
                            )}
                            onScroll={({ nativeEvent }) => {
                              const {
                                loadingMoreComments, commentsOffset, activitiesOffset,
                              } = this.state;
                              const flatList = nativeEvent;
                              const contentOffsetY = flatList.contentOffset.y;
                              const layoutMeasurementHeight = flatList.layoutMeasurement.height;
                              const contentSizeHeight = flatList.contentSize.height;
                              const heightOffsetSum = layoutMeasurementHeight + contentOffsetY;
                              const distanceToStart = contentSizeHeight - heightOffsetSum;

                              if (distanceToStart < 100) {
                                if (!loadingMoreComments) {
                                  if (commentsOffset < this.state.totalComments) {
                                    this.setState({
                                      loadingMoreComments: true,
                                    }, () => {
                                      this.getContactComments(this.state.contact.ID);
                                    });
                                  }
                                }
                                if (!this.state.loadingMoreActivities) {
                                  if (activitiesOffset < this.state.totalActivities) {
                                    this.setState({
                                      loadingMoreActivities: true,
                                    }, () => {
                                      this.getContactActivities(this.state.contact.ID);
                                    });
                                  }
                                }
                              }
                            }}
                          />
                          <KeyboardAccessory>
                            <View
                              style={{
                                backgroundColor: 'white',
                                flexDirection: 'row',
                              }}
                            >
                              <TextInput
                                placeholder={i18n.t('global.writeYourCommentNoteHere')}
                                value={this.state.comment}
                                onChangeText={this.setComment}
                                style={{
                                  borderColor: '#B4B4B4',
                                  borderRadius: 5,
                                  borderWidth: 1,
                                  flex: 1,
                                  margin: 10,
                                  paddingLeft: 5,
                                  paddingRight: 5,
                                }}
                              />
                              <TouchableOpacity
                                onPress={() => this.onSaveComment()}
                                style={{
                                  backgroundColor: Colors.tintColor,
                                  borderRadius: 80,
                                  height: 40,
                                  margin: 10,
                                  paddingTop: 7,
                                  paddingLeft: 10,
                                  width: 40,
                                }}
                              >
                                <Icon
                                  android="md-send"
                                  ios="ios-send"
                                  style={{ color: 'white', fontSize: 25 }}
                                />
                              </TouchableOpacity>
                            </View>
                          </KeyboardAccessory>
                        </View>
                      </Tab>
                      <Tab
                        heading={i18n.t('contactDetailScreen.connections')}
                        tabStyle={styles.tabStyle}
                        textStyle={styles.textStyle}
                        activeTabStyle={styles.activeTabStyle}
                        activeTextStyle={styles.activeTextStyle}
                      >
                        <ScrollView
                          keyboardShouldPersistTaps="handled"
                          refreshControl={(
                            <RefreshControl
                              refreshing={this.state.loading}
                              onRefresh={() => this.onRefresh(this.state.contact.ID)}
                            />
                          )}
                        >
                          <View
                            style={[styles.formContainer, { marginTop: 10 }]}
                          >
                            <Grid>
                              <Row>
                                <Col />
                                <Col>
                                  <Text style={{ color: Colors.tintColor, fontSize: 15, textAlign: 'right' }} onPress={() => this.onEnableEdit()}>
                                    {i18n.t('global.edit')}
                                  </Text>
                                </Col>
                              </Row>
                            </Grid>
                            <Row style={[styles.formRow, { paddingTop: 15 }]}>
                              <Col style={[styles.formIconLabel, { marginRight: 10 }]}>
                                <Icon
                                  type="FontAwesome"
                                  name="users"
                                  style={styles.formIcon}
                                />
                              </Col>
                              <Col>
                                <Text style={{ marginTop: 'auto', marginBottom: 'auto' }}>{this.state.contact.groups.values.map(group => `${group.name}, `)}</Text>
                              </Col>
                              <Col style={styles.formParentLabel}>
                                <Label style={styles.formLabel}>
                                  {i18n.t('contactDetailScreen.group')}
                                </Label>
                              </Col>
                            </Row>
                            <View style={styles.formDivider} />
                            <Row style={[styles.formRow, { paddingTop: 15 }]}>
                              <Col style={[styles.formIconLabel, { marginRight: 10 }]}>
                                <Icon
                                  type="Entypo"
                                  name="network"
                                  style={styles.formIcon}
                                />
                              </Col>
                              <Col>
                                <Text style={{ marginTop: 'auto', marginBottom: 'auto' }}>{this.state.contact.relation.values.map(relation => `${relation.name}, `)}</Text>
                              </Col>
                              <Col style={styles.formParentLabel}>
                                <Label style={styles.formLabel}>
                                  {i18n.t('contactDetailScreen.connection')}
                                </Label>
                              </Col>
                            </Row>
                            <View style={styles.formDivider} />
                            <Row style={[styles.formRow, { paddingTop: 15 }]}>
                              <Col style={[styles.formIconLabel, { marginRight: 10 }]}>
                                <Icon
                                  type="Entypo"
                                  name="water"
                                  style={styles.formIcon}
                                />
                              </Col>
                              <Col>
                                <Text style={{ marginTop: 'auto', marginBottom: 'auto' }}>{this.state.contact.baptized_by.values.map(baptizedBy => `${baptizedBy.name}, `)}</Text>
                              </Col>
                              <Col style={styles.formParentLabel}>
                                <Label style={styles.formLabel}>
                                  {i18n.t('contactDetailScreen.baptizedBy')}
                                </Label>
                              </Col>
                            </Row>
                            <View style={styles.formDivider} />
                            <Row style={[styles.formRow, { paddingTop: 15 }]}>
                              <Col style={[styles.formIconLabel, { marginRight: 10 }]}>
                                <Icon
                                  type="Entypo"
                                  name="water"
                                  style={styles.formIcon}
                                />
                              </Col>
                              <Col>
                                <Text style={{ marginTop: 'auto', marginBottom: 'auto' }}>{this.state.contact.baptized.values.map(baptized => `${baptized.name}, `)}</Text>
                              </Col>
                              <Col style={styles.formParentLabel}>
                                <Label style={styles.formLabel}>
                                  {i18n.t('contactDetailScreen.baptized')}
                                </Label>
                              </Col>
                            </Row>
                            <View style={styles.formDivider} />
                            <Row style={[styles.formRow, { paddingTop: 15 }]}>
                              <Col style={[styles.formIconLabel, { marginRight: 10 }]}>
                                <Icon
                                  type="FontAwesome"
                                  name="black-tie"
                                  style={styles.formIcon}
                                />
                              </Col>
                              <Col>
                                <Text style={{ marginTop: 'auto', marginBottom: 'auto' }}>{this.state.contact.coached_by.values.map(coached => `${coached.name}, `)}</Text>
                              </Col>
                              <Col style={styles.formParentLabel}>
                                <Label style={styles.formLabel}>
                                  {i18n.t('contactDetailScreen.coachedBy')}
                                </Label>
                              </Col>
                            </Row>
                            <View style={styles.formDivider} />
                            <Row style={[styles.formRow, { paddingTop: 15 }]}>
                              <Col style={[styles.formIconLabel, { marginRight: 10 }]}>
                                <Icon
                                  type="MaterialCommunityIcons"
                                  name="presentation"
                                  style={styles.formIcon}
                                />
                              </Col>
                              <Col>
                                <Text style={{ marginTop: 'auto', marginBottom: 'auto' }}>{this.state.contact.coaching.values.map(coaching => `${coaching.name}, `)}</Text>
                              </Col>
                              <Col style={styles.formParentLabel}>
                                <Label style={styles.formLabel}>
                                  {i18n.t('contactDetailScreen.coaching')}
                                </Label>
                              </Col>
                            </Row>
                            <View style={styles.formDivider} />
                          </View>
                        </ScrollView>
                      </Tab>
                    </Tabs>
                    {this.state.renderFab && (
                      <Fab
                        active={this.state.activeFab}
                        onPress={() => this.setToggleFab()}
                        style={{ backgroundColor: Colors.tintColor }}
                      >
                        <Icon
                          type="MaterialCommunityIcons"
                          name="comment-plus"
                          style={{ color: 'white' }}
                        />
                        <Button style={{ backgroundColor: Colors.tintColor }}>
                          <Icon
                            type="Feather"
                            name="phone-off"
                            style={{ color: 'white' }}
                            onPress={() => this.onSaveContact({
                              quick_button_no_answer:
                                parseInt(
                                  this.state.contact.quick_button_no_answer,
                                  10,
                                ) + 1,
                            })
                            }
                          />
                        </Button>
                        <Button style={{ backgroundColor: Colors.tintColor }}>
                          <Icon
                            type="MaterialCommunityIcons"
                            name="phone-in-talk"
                            style={{ color: 'white' }}
                            onPress={() => this.onSaveContact({
                              quick_button_contact_established:
                                parseInt(
                                  this.state.contact
                                    .quick_button_contact_established,
                                  10,
                                ) + 1,
                            })
                            }
                          />
                        </Button>
                        <Button style={{ backgroundColor: Colors.tintColor }}>
                          <Icon
                            type="MaterialCommunityIcons"
                            name="calendar-plus"
                            style={{ color: 'white' }}
                            onPress={() => this.onSaveContact({
                              quick_button_meeting_scheduled:
                                parseInt(
                                  this.state.contact.quick_button_meeting_scheduled,
                                  10,
                                ) + 1,
                            })
                            }
                          />
                        </Button>
                        <Button style={{ backgroundColor: Colors.tintColor }}>
                          <Icon
                            type="MaterialCommunityIcons"
                            name="calendar-check"
                            style={{ color: 'white' }}
                            onPress={() => this.onSaveContact({
                              quick_button_meeting_complete:
                                parseInt(
                                  this.state.contact.quick_button_meeting_complete,
                                  10,
                                ) + 1,
                            })
                            }
                          />
                        </Button>
                        <Button style={{ backgroundColor: Colors.tintColor }}>
                          <Icon
                            type="MaterialCommunityIcons"
                            name="calendar-remove"
                            style={{ color: 'white' }}
                            onPress={() => this.onSaveContact({
                              quick_button_no_show:
                                parseInt(
                                  this.state.contact.quick_button_no_show,
                                  10,
                                ) + 1,
                            })
                            }
                          />
                        </Button>
                      </Fab>
                    )}
                  </View>
                )}
                {!this.state.onlyView && (
                  <KeyboardShift>
                    {() => (
                      <Container>
                        <Content>
                          <ScrollView keyboardShouldPersistTaps="handled">
                            {this.state.currentTabIndex === 0 && (
                              <View style={styles.formContainer}>
                                <Row style={styles.formFieldPadding}>
                                  <Col style={styles.formIconLabelCol}>
                                    <View style={styles.formIconLabelView}>
                                      <Icon
                                        type="FontAwesome"
                                        name="user"
                                        style={styles.formIcon}
                                      />
                                    </View>
                                  </Col>
                                  <Col>
                                    <Label
                                      style={styles.formLabel}
                                    >
                                      {i18n.t('contactDetailScreen.fullName')}
                                    </Label>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col style={styles.formIconLabelCol}>
                                    <View style={styles.formIconLabelView}>
                                      <Icon
                                        type="FontAwesome"
                                        name="user"
                                        style={[styles.formIcon, { opacity: 0 }]}
                                      />
                                    </View>
                                  </Col>
                                  <Col>
                                    <Input
                                      value={this.state.contact.title}
                                      onChangeText={this.setContactTitle}
                                      style={{
                                        borderBottomWidth: 1,
                                        borderStyle: 'solid',
                                        borderBottomColor: '#D9D5DC',
                                        fontSize: 15,
                                        height: 10,
                                      }}
                                    />
                                  </Col>
                                </Row>
                                <Row style={styles.formFieldPadding}>
                                  <Col style={styles.formIconLabelCol}>
                                    <View style={styles.formIconLabelView}>
                                      <Icon
                                        type="FontAwesome"
                                        name="user-circle"
                                        style={styles.formIcon}
                                      />
                                    </View>
                                  </Col>
                                  <Col>
                                    <Label
                                      style={styles.formLabel}
                                    >
                                      {i18n.t('global.assignedTo')}
                                    </Label>
                                  </Col>
                                </Row>
                                <TouchableOpacity
                                  onPress={() => {
                                    this.updateShowAssignedToModal(true);
                                  }}
                                >
                                  <Row>
                                    <Col style={styles.formIconLabelCol}>
                                      <View style={styles.formIconLabelView}>
                                        <Icon
                                          type="FontAwesome"
                                          name="user-circle"
                                          style={[styles.formIcon, { opacity: 0 }]}
                                        />
                                      </View>
                                    </Col>
                                    <Col style={{
                                      borderBottomWidth: 1,
                                      borderStyle: 'solid',
                                      borderBottomColor: '#D9D5DC',
                                    }}
                                    >
                                      {this.showAssignedUser()}
                                      <ModalFilterPicker
                                        visible={this.state.showAssignedToModal}
                                        onSelect={this.onSelectAssignedTo}
                                        onCancel={this.onCancelAssignedTo}
                                        options={this.state.users}
                                      />
                                    </Col>
                                  </Row>
                                </TouchableOpacity>
                                <Row style={styles.formFieldPadding}>
                                  <Col style={styles.formIconLabelCol}>
                                    <View style={styles.formIconLabelView}>
                                      <Icon
                                        type="Ionicons"
                                        name="md-people"
                                        style={styles.formIcon}
                                      />
                                    </View>
                                  </Col>
                                  <Col>
                                    <Label
                                      style={styles.formLabel}
                                    >
                                      {i18n.t('contactDetailScreen.subAssignedTo')}
                                    </Label>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col style={styles.formIconLabelCol}>
                                    <View style={styles.formIconLabelView}>
                                      <Icon
                                        type="Ionicons"
                                        name="md-people"
                                        style={[styles.formIcon, { opacity: 0 }]}
                                      />
                                    </View>
                                  </Col>
                                  <Col>
                                    <Selectize
                                      ref={(selectize) => { subAssignedSelectizeRef = selectize; }}
                                      itemId="value"
                                      items={this.state.usersContacts}
                                      selectedItems={this.state.contact.subassigned.values}
                                      textInputProps={{
                                        placeholder: i18n.t('contactDetailScreen.subAssignThisContact'),
                                      }}
                                      renderChip={(id, onClose, item, style, iconStyle) => (
                                        <Chip
                                          key={id}
                                          iconStyle={iconStyle}
                                          onClose={onClose}
                                          text={item.name}
                                          style={style}
                                        />
                                      )}
                                      renderRow={(id, onPress, item) => (
                                        <TouchableOpacity
                                          activeOpacity={0.6}
                                          key={id}
                                          onPress={onPress}
                                          style={{
                                            paddingVertical: 8,
                                            paddingHorizontal: 10,
                                          }}
                                        >
                                          <View style={{
                                            flexDirection: 'row',
                                          }}
                                          >
                                            <Text style={{
                                              color: 'rgba(0, 0, 0, 0.87)',
                                              fontSize: 14,
                                              lineHeight: 21,
                                            }}
                                            >
                                              {item.name}
                                            </Text>
                                            <Text style={{
                                              color: 'rgba(0, 0, 0, 0.54)',
                                              fontSize: 14,
                                              lineHeight: 21,
                                            }}
                                            >
                                              {' '}
                                              (#
                                              {id}
                                              )
                                            </Text>
                                          </View>
                                        </TouchableOpacity>
                                      )}
                                      filterOnKey="name"
                                      inputContainerStyle={{ borderWidth: 1, borderColor: '#CCCCCC', padding: 5 }}
                                    />
                                  </Col>
                                </Row>
                                <Row style={styles.formFieldPadding}>
                                  <Col style={styles.formIconLabelCol}>
                                    <View style={styles.formIconLabelView}>
                                      <Icon
                                        type="FontAwesome"
                                        name="phone"
                                        style={styles.formIcon}
                                      />
                                    </View>
                                  </Col>
                                  <Col>
                                    <Label
                                      style={styles.formLabel}
                                    >
                                      {i18n.t('contactDetailScreen.mobile')}
                                    </Label>
                                  </Col>
                                  <Col style={styles.formIconLabel}>
                                    <Icon
                                      android="md-add"
                                      ios="ios-add"
                                      style={[styles.formIcon, styles.addRemoveIcons]}
                                      onPress={this.onAddPhoneField}
                                    />
                                  </Col>
                                </Row>
                                {this.state.contact.contact_phone.map(
                                  (phone, index) => (!phone.delete ? (
                                    <Row
                                      key={index.toString()}
                                    >
                                      <Col style={styles.formIconLabelCol}>
                                        <View style={styles.formIconLabelView}>
                                          <Icon
                                            type="FontAwesome"
                                            name="phone"
                                            style={[styles.formIcon, { opacity: 0 }]}
                                          />
                                        </View>
                                      </Col>
                                      <Col>
                                        <Input
                                          multiline
                                          value={phone.value}
                                          onChangeText={(value) => {
                                            this.onPhoneFieldChange(
                                              value,
                                              index,
                                              phone.key,
                                              this,
                                            );
                                          }}
                                          style={styles.inputContactAddress}
                                        />
                                      </Col>
                                      <Col style={styles.formIconLabel}>
                                        <Icon
                                          android="md-remove"
                                          ios="ios-remove"
                                          style={[styles.formIcon, styles.addRemoveIcons]}
                                          onPress={() => {
                                            this.onRemovePhoneField(
                                              index,
                                              this,
                                            );
                                          }}
                                        />
                                      </Col>
                                    </Row>
                                  ) : null),
                                )}
                                <Row style={styles.formFieldPadding}>
                                  <Col style={styles.formIconLabelCol}>
                                    <View style={styles.formIconLabelView}>
                                      <Icon
                                        type="FontAwesome"
                                        name="envelope"
                                        style={styles.formIcon}
                                      />
                                    </View>
                                  </Col>
                                  <Col>
                                    <Label
                                      style={styles.formLabel}
                                    >
                                      {i18n.t('contactDetailScreen.email')}
                                    </Label>
                                  </Col>
                                  <Col style={styles.formIconLabel}>
                                    <Icon
                                      android="md-add"
                                      ios="ios-add"
                                      style={[styles.formIcon, styles.addRemoveIcons]}
                                      onPress={this.onAddEmailField}
                                    />
                                  </Col>
                                </Row>
                                {this.state.contact.contact_email.map(
                                  (email, index) => (!email.delete ? (
                                    <Row
                                      key={index.toString()}
                                    >
                                      <Col style={styles.formIconLabelCol}>
                                        <View style={styles.formIconLabelView}>
                                          <Icon
                                            type="FontAwesome"
                                            name="envelope"
                                            style={[styles.formIcon, { opacity: 0 }]}
                                          />
                                        </View>
                                      </Col>
                                      <Col>
                                        <Input
                                          multiline
                                          value={email.value}
                                          onChangeText={(value) => {
                                            this.onEmailFieldChange(
                                              value,
                                              index,
                                              email.key,
                                              this,
                                            );
                                          }}
                                          style={styles.inputContactAddress}
                                        />
                                      </Col>
                                      <Col style={styles.formIconLabel}>
                                        <Icon
                                          android="md-remove"
                                          ios="ios-remove"
                                          style={[styles.formIcon, styles.addRemoveIcons]}
                                          onPress={() => {
                                            this.onRemoveEmailField(
                                              index,
                                              this,
                                            );
                                          }}
                                        />
                                      </Col>
                                    </Row>
                                  ) : null),
                                )}
                                <Row style={styles.formFieldPadding}>
                                  <Col style={styles.formIconLabelCol}>
                                    <View style={styles.formIconLabelView}>
                                      <Icon
                                        type="Entypo"
                                        name="home"
                                        style={styles.formIcon}
                                      />
                                    </View>
                                  </Col>
                                  <Col>
                                    <Label
                                      style={styles.formLabel}
                                    >
                                      {i18n.t('global.address')}
                                    </Label>
                                  </Col>
                                  <Col style={styles.formIconLabel}>
                                    <Icon
                                      android="md-add"
                                      ios="ios-add"
                                      style={[styles.formIcon, styles.addRemoveIcons]}
                                      onPress={this.onAddAddressField}
                                    />
                                  </Col>
                                </Row>
                                {this.state.contact.contact_address.map(
                                  (address, index) => (!address.delete ? (
                                    <Row
                                      key={index.toString()}
                                    >
                                      <Col style={styles.formIconLabelCol}>
                                        <View style={styles.formIconLabelView}>
                                          <Icon
                                            type="Entypo"
                                            name="home"
                                            style={[styles.formIcon, { opacity: 0 }]}
                                          />
                                        </View>
                                      </Col>
                                      <Col>
                                        <Input
                                          multiline
                                          value={address.value}
                                          onChangeText={(value) => {
                                            this.onAddressFieldChange(
                                              value,
                                              index,
                                              address.key,
                                              this,
                                            );
                                          }}
                                          style={styles.inputContactAddress}
                                        />
                                      </Col>
                                      <Col style={styles.formIconLabel}>
                                        <Icon
                                          android="md-remove"
                                          ios="ios-remove"
                                          style={[styles.formIcon, styles.addRemoveIcons]}
                                          onPress={() => {
                                            this.onRemoveAddressField(
                                              index,
                                              this,
                                            );
                                          }}
                                        />
                                      </Col>
                                    </Row>
                                  ) : null),
                                )}
                                <Row style={styles.formFieldPadding}>
                                  <Col style={styles.formIconLabelCol}>
                                    <View style={styles.formIconLabelView}>
                                      <Icon
                                        type="FontAwesome"
                                        name="map-marker"
                                        style={styles.formIcon}
                                      />
                                    </View>
                                  </Col>
                                  <Col>
                                    <Label
                                      style={styles.formLabel}
                                    >
                                      {i18n.t('global.location')}
                                    </Label>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col style={styles.formIconLabelCol}>
                                    <View style={styles.formIconLabelView}>
                                      <Icon
                                        type="FontAwesome"
                                        name="map-marker"
                                        style={[styles.formIcon, { opacity: 0 }]}
                                      />
                                    </View>
                                  </Col>
                                  <Col>
                                    <Selectize
                                      ref={(selectize) => { geonamesSelectizeRef = selectize; }}
                                      itemId="value"
                                      items={this.state.geonames}
                                      selectedItems={this.state.contact.geonames.values}
                                      textInputProps={{
                                        placeholder: i18n.t('contactDetailScreen.selectLocations'),
                                      }}
                                      renderRow={(id, onPress, item) => (
                                        <TouchableOpacity
                                          activeOpacity={0.6}
                                          key={id}
                                          onPress={onPress}
                                          style={{
                                            paddingVertical: 8,
                                            paddingHorizontal: 10,
                                          }}
                                        >
                                          <View style={{
                                            flexDirection: 'row',
                                          }}
                                          >
                                            <Text style={{
                                              color: 'rgba(0, 0, 0, 0.87)',
                                              fontSize: 14,
                                              lineHeight: 21,
                                            }}
                                            >
                                              {item.name}
                                            </Text>
                                          </View>
                                        </TouchableOpacity>
                                      )}
                                      renderChip={(id, onClose, item, style, iconStyle) => (
                                        <Chip
                                          key={id}
                                          iconStyle={iconStyle}
                                          onClose={onClose}
                                          text={item.name}
                                          style={style}
                                        />
                                      )}
                                      filterOnKey="name"
                                      inputContainerStyle={{ borderWidth: 1, borderColor: '#CCCCCC', padding: 5 }}
                                    />
                                  </Col>
                                </Row>
                                <Row style={styles.formFieldPadding}>
                                  <Col style={styles.formIconLabelCol}>
                                    <View style={styles.formIconLabelView}>
                                      <Icon
                                        type="FontAwesome"
                                        name="globe"
                                        style={styles.formIcon}
                                      />
                                    </View>
                                  </Col>
                                  <Col>
                                    <Label
                                      style={styles.formLabel}
                                    >
                                      {i18n.t('global.peopleGroup')}
                                    </Label>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col style={styles.formIconLabelCol}>
                                    <View style={styles.formIconLabelView}>
                                      <Icon
                                        type="FontAwesome"
                                        name="globe"
                                        style={[styles.formIcon, { opacity: 0 }]}
                                      />
                                    </View>
                                  </Col>
                                  <Col>
                                    <Selectize
                                      ref={(selectize) => { peopleGroupsSelectizeRef = selectize; }}
                                      itemId="value"
                                      items={this.state.peopleGroups}
                                      selectedItems={this.state.contact.people_groups.values}
                                      textInputProps={{
                                        placeholder: i18n.t('global.selectPeopleGroups'),
                                      }}
                                      renderRow={(id, onPress, item) => (
                                        <TouchableOpacity
                                          activeOpacity={0.6}
                                          key={id}
                                          onPress={onPress}
                                          style={{
                                            paddingVertical: 8,
                                            paddingHorizontal: 10,
                                          }}
                                        >
                                          <View style={{
                                            flexDirection: 'row',
                                          }}
                                          >
                                            <Text style={{
                                              color: 'rgba(0, 0, 0, 0.87)',
                                              fontSize: 14,
                                              lineHeight: 21,
                                            }}
                                            >
                                              {item.name}
                                            </Text>
                                          </View>
                                        </TouchableOpacity>
                                      )}
                                      renderChip={(id, onClose, item, style, iconStyle) => (
                                        <Chip
                                          key={id}
                                          iconStyle={iconStyle}
                                          onClose={onClose}
                                          text={item.name}
                                          style={style}
                                        />
                                      )}
                                      filterOnKey="name"
                                      keyboardShouldPersistTaps
                                      inputContainerStyle={{ borderWidth: 1, borderColor: '#CCCCCC', padding: 5 }}
                                    />
                                  </Col>
                                </Row>
                                <Row style={styles.formFieldPadding}>
                                  <Col style={styles.formIconLabelCol}>
                                    <View style={styles.formIconLabelView}>
                                      <Icon
                                        type="FontAwesome"
                                        name="clock-o"
                                        style={styles.formIcon}
                                      />
                                    </View>
                                  </Col>
                                  <Col>
                                    <Label
                                      style={styles.formLabel}
                                    >
                                      {i18n.t('contactDetailScreen.age')}
                                    </Label>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col style={styles.formIconLabelCol}>
                                    <View style={styles.formIconLabelView}>
                                      <Icon
                                        type="FontAwesome"
                                        name="clock-o"
                                        style={[styles.formIcon, { opacity: 0 }]}
                                      />
                                    </View>
                                  </Col>
                                  <Col>
                                    <Picker
                                      mode="dropdown"
                                      selectedValue={this.state.contact.age}
                                      onValueChange={this.setContactAge}
                                    >
                                      <Picker.Item label="" value="not-set" />
                                      <Picker.Item
                                        label={i18n.t('contactDetailScreen.contactAge.underEighteenYearsOld')}
                                        value="<19"
                                      />
                                      <Picker.Item
                                        label={i18n.t('contactDetailScreen.contactAge.underTwentySixYearsOld')}
                                        value="<26"
                                      />
                                      <Picker.Item
                                        label={i18n.t('contactDetailScreen.contactAge.underFortyOneYearsOld')}
                                        value="<41"
                                      />
                                      <Picker.Item
                                        label={i18n.t('contactDetailScreen.contactAge.overFortyYearsOld')}
                                        value=">41"
                                      />
                                    </Picker>
                                  </Col>
                                </Row>
                                <Row style={styles.formFieldPadding}>
                                  <Col style={styles.formIconLabelCol}>
                                    <View style={styles.formIconLabelView}>
                                      <Icon
                                        android="md-male"
                                        ios="ios-male"
                                        style={styles.formIcon}
                                      />
                                    </View>
                                  </Col>
                                  <Col>
                                    <Label
                                      style={styles.formLabel}
                                    >
                                      {i18n.t('contactDetailScreen.gender')}
                                    </Label>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col style={styles.formIconLabelCol}>
                                    <View style={styles.formIconLabelView}>
                                      <Icon
                                        android="md-male"
                                        ios="ios-male"
                                        style={[styles.formIcon, { opacity: 0 }]}
                                      />
                                    </View>
                                  </Col>
                                  <Col>
                                    <Picker
                                      mode="dropdown"
                                      selectedValue={this.state.contact.gender}
                                      onValueChange={this.setContactGender}
                                    >
                                      <Picker.Item label="" value="not-set" />
                                      <Picker.Item label={i18n.t('contactDetailScreen.male')} value="male" />
                                      <Picker.Item label={i18n.t('contactDetailScreen.female')} value="female" />
                                    </Picker>
                                  </Col>
                                </Row>
                                <Row style={styles.formFieldPadding}>
                                  <Col style={styles.formIconLabelCol}>
                                    <View style={styles.formIconLabelView}>
                                      <Icon
                                        android="md-arrow-dropright"
                                        ios="ios-arrow-dropright"
                                        style={styles.formIcon}
                                      />
                                    </View>
                                  </Col>
                                  <Col>
                                    <Label
                                      style={styles.formLabel}
                                    >
                                      {i18n.t('contactDetailScreen.source')}
                                    </Label>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col style={styles.formIconLabelCol}>
                                    <View style={styles.formIconLabelView}>
                                      <Icon
                                        android="md-arrow-dropright"
                                        ios="ios-arrow-dropright"
                                        style={[styles.formIcon, { opacity: 0 }]}
                                      />
                                    </View>
                                  </Col>
                                  <Col>
                                    <Selectize
                                      ref={(selectize) => { sourcesSelectizeRef = selectize; }}
                                      itemId="value"
                                      items={this.state.contactSources}
                                      selectedItems={this.state.contact.sources.values}
                                      textInputProps={{
                                        placeholder: i18n.t('contactDetailScreen.selectSources'),
                                      }}
                                      renderRow={(id, onPress, item) => (
                                        <TouchableOpacity
                                          activeOpacity={0.6}
                                          key={id}
                                          onPress={onPress}
                                          style={{
                                            paddingVertical: 8,
                                            paddingHorizontal: 10,
                                          }}
                                        >
                                          <View style={{
                                            flexDirection: 'row',
                                          }}
                                          >
                                            <Text style={{
                                              color: 'rgba(0, 0, 0, 0.87)',
                                              fontSize: 14,
                                              lineHeight: 21,
                                            }}
                                            >
                                              {item.name}
                                            </Text>
                                          </View>
                                        </TouchableOpacity>
                                      )}
                                      renderChip={(id, onClose, item, style, iconStyle) => (
                                        <Chip
                                          key={id}
                                          iconStyle={iconStyle}
                                          onClose={onClose}
                                          text={item.name}
                                          style={style}
                                        />
                                      )}
                                      filterOnKey="name"
                                      keyboardShouldPersistTaps
                                      inputContainerStyle={{ borderWidth: 1, borderColor: '#CCCCCC', padding: 5 }}
                                    />
                                  </Col>
                                </Row>
                              </View>
                            )}
                            {this.state.currentTabIndex === 1 && (
                              <View style={styles.formContainer}>
                                <Row style={styles.formFieldPadding}>
                                  <Col style={styles.formIconLabelCol}>
                                    <View style={styles.formIconLabelView}>
                                      <Icon
                                        android="md-calendar"
                                        ios="ios-calendar"
                                        style={styles.formIcon}
                                      />
                                    </View>
                                  </Col>
                                  <Col>
                                    <Label
                                      style={styles.formLabel}
                                    >
                                      {i18n.t('contactDetailScreen.seekerPath')}
                                    </Label>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col style={styles.formIconLabelCol}>
                                    <View style={styles.formIconLabelView}>
                                      <Icon
                                        type="FontAwesome"
                                        name="user-circle"
                                        style={[styles.formIcon, { opacity: 0 }]}
                                      />
                                    </View>
                                  </Col>
                                  <Col>
                                    <Picker
                                      mode="dropdown"
                                      selectedValue={this.state.contact.seeker_path}
                                      onValueChange={this.setContactSeekerPath}
                                      textStyle={{ color: Colors.tintColor }}
                                    >
                                      <Picker.Item
                                        label={i18n.t('global.seekerPath.none')}
                                        value="none"
                                      />
                                      <Picker.Item
                                        label={i18n.t('global.seekerPath.attempted')}
                                        value="attempted"
                                      />
                                      <Picker.Item
                                        label={i18n.t('global.seekerPath.established')}
                                        value="established"
                                      />
                                      <Picker.Item
                                        label={i18n.t('global.seekerPath.scheduled')}
                                        value="scheduled"
                                      />
                                      <Picker.Item
                                        label={i18n.t('global.seekerPath.met')}
                                        value="met"
                                      />
                                      <Picker.Item
                                        label={i18n.t('global.seekerPath.ongoing')}
                                        value="ongoing"
                                      />
                                      <Picker.Item
                                        label={i18n.t('global.seekerPath.coaching')}
                                        value="coaching"
                                      />
                                    </Picker>
                                  </Col>
                                </Row>
                                <Label
                                  style={[
                                    styles.formLabel,
                                    { fontWeight: 'bold', marginBottom: 10, marginTop: 20 },
                                  ]}
                                >
                                  {i18n.t('contactDetailScreen.faithMilestones')}
                                </Label>
                                {this.renderfaithMilestones()}
                                <Row style={styles.formFieldPadding}>
                                  <Col style={styles.formIconLabelCol}>
                                    <View style={styles.formIconLabelView}>
                                      <Icon
                                        type="Entypo"
                                        name="water"
                                        style={styles.formIcon}
                                      />
                                    </View>
                                  </Col>
                                  <Col>
                                    <Label
                                      style={styles.formLabel}
                                    >
                                      {i18n.t('contactDetailScreen.milestones.baptismDate')}
                                    </Label>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col style={styles.formIconLabelCol}>
                                    <View style={styles.formIconLabelView}>
                                      <Icon
                                        type="Entypo"
                                        name="water"
                                        style={[styles.formIcon, { opacity: 0 }]}
                                      />
                                    </View>
                                  </Col>
                                  <Col>
                                    <DatePicker
                                      onDateChange={this.setBaptismDate}
                                      defaultDate={(this.state.contact.baptism_date.length > 0) ? new Date(this.state.contact.baptism_date) : ''}
                                    />
                                  </Col>
                                </Row>
                              </View>
                            )}
                            {this.state.currentTabIndex === 3 && (
                              <View style={styles.formContainer}>
                                <Row style={styles.formFieldPadding}>
                                  <Col style={styles.formIconLabelCol}>
                                    <View style={styles.formIconLabelView}>
                                      <Icon
                                        type="FontAwesome"
                                        name="users"
                                        style={styles.formIcon}
                                      />
                                    </View>
                                  </Col>
                                  <Col>
                                    <Label
                                      style={styles.formLabel}
                                    >
                                      {i18n.t('contactDetailScreen.group')}
                                    </Label>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col style={styles.formIconLabelCol}>
                                    <View style={styles.formIconLabelView}>
                                      <Icon
                                        type="FontAwesome"
                                        name="user-circle"
                                        style={[styles.formIcon, { opacity: 0 }]}
                                      />
                                    </View>
                                  </Col>
                                  <Col>
                                    <Selectize
                                      ref={(selectize) => { groupsSelectizeRef = selectize; }}
                                      itemId="value"
                                      items={this.state.groups}
                                      selectedItems={this.state.contact.groups.values}
                                      textInputProps={{
                                        placeholder: i18n.t('contactDetailScreen.addGroup'),
                                      }}
                                      renderRow={(id, onPress, item) => (
                                        <TouchableOpacity
                                          activeOpacity={0.6}
                                          key={id}
                                          onPress={onPress}
                                          style={{
                                            paddingVertical: 8,
                                            paddingHorizontal: 10,
                                          }}
                                        >
                                          <View style={{
                                            flexDirection: 'row',
                                          }}
                                          >
                                            <Text style={{
                                              color: 'rgba(0, 0, 0, 0.87)',
                                              fontSize: 14,
                                              lineHeight: 21,
                                            }}
                                            >
                                              {item.name}
                                            </Text>
                                          </View>
                                        </TouchableOpacity>
                                      )}
                                      renderChip={(id, onClose, item, style, iconStyle) => (
                                        <Chip
                                          key={id}
                                          iconStyle={iconStyle}
                                          onClose={onClose}
                                          text={item.name}
                                          style={style}
                                        />
                                      )}
                                      filterOnKey="name"
                                      keyboardShouldPersistTaps
                                      inputContainerStyle={{ borderWidth: 1, borderColor: '#CCCCCC', padding: 5 }}
                                    />
                                  </Col>
                                </Row>
                                <Row style={styles.formFieldPadding}>
                                  <Col style={styles.formIconLabelCol}>
                                    <View style={styles.formIconLabelView}>
                                      <Icon
                                        type="Entypo"
                                        name="network"
                                        style={styles.formIcon}
                                      />
                                    </View>
                                  </Col>
                                  <Col>
                                    <Label
                                      style={styles.formLabel}
                                    >
                                      {i18n.t('contactDetailScreen.connection')}
                                    </Label>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col style={styles.formIconLabelCol}>
                                    <View style={styles.formIconLabelView}>
                                      <Icon
                                        type="FontAwesome"
                                        name="user-circle"
                                        style={[styles.formIcon, { opacity: 0 }]}
                                      />
                                    </View>
                                  </Col>
                                  <Col>
                                    <Selectize
                                      ref={(selectize) => { connectionsSelectizeRef = selectize; }}
                                      itemId="value"
                                      items={this.state.usersContacts}
                                      selectedItems={this.state.contact.relation.values}
                                      textInputProps={{
                                        placeholder: i18n.t('contactDetailScreen.addConnection'),
                                      }}
                                      renderRow={(id, onPress, item) => (
                                        <TouchableOpacity
                                          activeOpacity={0.6}
                                          key={id}
                                          onPress={onPress}
                                          style={{
                                            paddingVertical: 8,
                                            paddingHorizontal: 10,
                                          }}
                                        >
                                          <View style={{
                                            flexDirection: 'row',
                                          }}
                                          >
                                            <Text style={{
                                              color: 'rgba(0, 0, 0, 0.87)',
                                              fontSize: 14,
                                              lineHeight: 21,
                                            }}
                                            >
                                              {item.name}
                                            </Text>
                                            <Text style={{
                                              color: 'rgba(0, 0, 0, 0.54)',
                                              fontSize: 14,
                                              lineHeight: 21,
                                            }}
                                            >
                                              {' '}
                                              (#
                                              {id}
                                              )
                                            </Text>
                                          </View>
                                        </TouchableOpacity>
                                      )}
                                      renderChip={(id, onClose, item, style, iconStyle) => (
                                        <Chip
                                          key={id}
                                          iconStyle={iconStyle}
                                          onClose={onClose}
                                          text={item.name}
                                          style={style}
                                        />
                                      )}
                                      filterOnKey="name"
                                      keyboardShouldPersistTaps
                                      inputContainerStyle={{ borderWidth: 1, borderColor: '#CCCCCC', padding: 5 }}
                                    />
                                  </Col>
                                </Row>
                                <Row style={styles.formFieldPadding}>
                                  <Col style={styles.formIconLabelCol}>
                                    <View style={styles.formIconLabelView}>
                                      <Icon
                                        type="Entypo"
                                        name="water"
                                        style={styles.formIcon}
                                      />
                                    </View>
                                  </Col>
                                  <Col>
                                    <Label
                                      style={styles.formLabel}
                                    >
                                      {i18n.t('contactDetailScreen.baptizedBy')}
                                    </Label>
                                  </Col>
                                </Row>
                                <Row>

                                  <Col style={styles.formIconLabelCol}>
                                    <View style={styles.formIconLabelView}>
                                      <Icon
                                        type="FontAwesome"
                                        name="user-circle"
                                        style={[styles.formIcon, { opacity: 0 }]}
                                      />
                                    </View>
                                  </Col>
                                  <Col>
                                    <Selectize
                                      ref={(selectize) => { baptizedBySelectizeRef = selectize; }}
                                      itemId="value"
                                      items={this.state.usersContacts}
                                      selectedItems={this.state.contact.baptized_by.values}
                                      textInputProps={{
                                        placeholder: i18n.t('contactDetailScreen.addBaptizedBy'),
                                      }}
                                      renderRow={(id, onPress, item) => (
                                        <TouchableOpacity
                                          activeOpacity={0.6}
                                          key={id}
                                          onPress={onPress}
                                          style={{
                                            paddingVertical: 8,
                                            paddingHorizontal: 10,
                                          }}
                                        >
                                          <View style={{
                                            flexDirection: 'row',
                                          }}
                                          >
                                            <Text style={{
                                              color: 'rgba(0, 0, 0, 0.87)',
                                              fontSize: 14,
                                              lineHeight: 21,
                                            }}
                                            >
                                              {item.name}
                                            </Text>
                                            <Text style={{
                                              color: 'rgba(0, 0, 0, 0.54)',
                                              fontSize: 14,
                                              lineHeight: 21,
                                            }}
                                            >
                                              {' '}
                                              (#
                                              {id}
                                              )
                                            </Text>
                                          </View>
                                        </TouchableOpacity>
                                      )}
                                      renderChip={(id, onClose, item, style, iconStyle) => (
                                        <Chip
                                          key={id}
                                          iconStyle={iconStyle}
                                          onClose={onClose}
                                          text={item.name}
                                          style={style}
                                        />
                                      )}
                                      filterOnKey="name"
                                      keyboardShouldPersistTaps
                                      inputContainerStyle={{ borderWidth: 1, borderColor: '#CCCCCC', padding: 5 }}
                                    />
                                  </Col>
                                </Row>
                                <Row style={styles.formFieldPadding}>
                                  <Col style={styles.formIconLabelCol}>
                                    <View style={styles.formIconLabelView}>
                                      <Icon
                                        type="Entypo"
                                        name="water"
                                        style={styles.formIcon}
                                      />
                                    </View>
                                  </Col>
                                  <Col>
                                    <Label
                                      style={styles.formLabel}
                                    >
                                      {i18n.t('contactDetailScreen.baptized')}
                                    </Label>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col style={styles.formIconLabelCol}>
                                    <View style={styles.formIconLabelView}>
                                      <Icon
                                        type="FontAwesome"
                                        name="user-circle"
                                        style={[styles.formIcon, { opacity: 0 }]}
                                      />
                                    </View>
                                  </Col>
                                  <Col>
                                    <Selectize
                                      ref={(selectize) => { baptizedSelectizeRef = selectize; }}
                                      itemId="value"
                                      items={this.state.usersContacts}
                                      selectedItems={this.state.contact.baptized.values}
                                      textInputProps={{
                                        placeholder: i18n.t('contactDetailScreen.addBaptized'),
                                      }}
                                      renderRow={(id, onPress, item) => (
                                        <TouchableOpacity
                                          activeOpacity={0.6}
                                          key={id}
                                          onPress={onPress}
                                          style={{
                                            paddingVertical: 8,
                                            paddingHorizontal: 10,
                                          }}
                                        >
                                          <View style={{
                                            flexDirection: 'row',
                                          }}
                                          >
                                            <Text style={{
                                              color: 'rgba(0, 0, 0, 0.87)',
                                              fontSize: 14,
                                              lineHeight: 21,
                                            }}
                                            >
                                              {item.name}
                                            </Text>
                                            <Text style={{
                                              color: 'rgba(0, 0, 0, 0.54)',
                                              fontSize: 14,
                                              lineHeight: 21,
                                            }}
                                            >
                                              {' '}
                                              (#
                                              {id}
                                              )
                                            </Text>
                                          </View>
                                        </TouchableOpacity>
                                      )}
                                      renderChip={(id, onClose, item, style, iconStyle) => (
                                        <Chip
                                          key={id}
                                          iconStyle={iconStyle}
                                          onClose={onClose}
                                          text={item.name}
                                          style={style}
                                        />
                                      )}
                                      filterOnKey="name"
                                      keyboardShouldPersistTaps
                                      inputContainerStyle={{ borderWidth: 1, borderColor: '#CCCCCC', padding: 5 }}
                                    />
                                  </Col>
                                </Row>
                                <Row style={styles.formFieldPadding}>
                                  <Col style={styles.formIconLabelCol}>
                                    <View style={styles.formIconLabelView}>
                                      <Icon
                                        type="FontAwesome"
                                        name="black-tie"
                                        style={styles.formIcon}
                                      />
                                    </View>
                                  </Col>
                                  <Col>
                                    <Label
                                      style={styles.formLabel}
                                    >
                                      {i18n.t('contactDetailScreen.coachedBy')}
                                    </Label>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col style={styles.formIconLabelCol}>
                                    <View style={styles.formIconLabelView}>
                                      <Icon
                                        type="FontAwesome"
                                        name="user-circle"
                                        style={[styles.formIcon, { opacity: 0 }]}
                                      />
                                    </View>
                                  </Col>
                                  <Col>
                                    <Selectize
                                      ref={(selectize) => { coachedSelectizeRef = selectize; }}
                                      itemId="value"
                                      items={this.state.usersContacts}
                                      selectedItems={this.state.contact.coached_by.values}
                                      textInputProps={{
                                        placeholder: i18n.t('contactDetailScreen.addCoachedBy'),
                                      }}
                                      renderRow={(id, onPress, item) => (
                                        <TouchableOpacity
                                          activeOpacity={0.6}
                                          key={id}
                                          onPress={onPress}
                                          style={{
                                            paddingVertical: 8,
                                            paddingHorizontal: 10,
                                          }}
                                        >
                                          <View style={{
                                            flexDirection: 'row',
                                          }}
                                          >
                                            <Text style={{
                                              color: 'rgba(0, 0, 0, 0.87)',
                                              fontSize: 14,
                                              lineHeight: 21,
                                            }}
                                            >
                                              {item.name}
                                            </Text>
                                            <Text style={{
                                              color: 'rgba(0, 0, 0, 0.54)',
                                              fontSize: 14,
                                              lineHeight: 21,
                                            }}
                                            >
                                              {' '}
                                              (#
                                              {id}
                                              )
                                            </Text>
                                          </View>
                                        </TouchableOpacity>
                                      )}
                                      renderChip={(id, onClose, item, style, iconStyle) => (
                                        <Chip
                                          key={id}
                                          iconStyle={iconStyle}
                                          onClose={onClose}
                                          text={item.name}
                                          style={style}
                                        />
                                      )}
                                      filterOnKey="name"
                                      keyboardShouldPersistTaps
                                      inputContainerStyle={{ borderWidth: 1, borderColor: '#CCCCCC', padding: 5 }}
                                    />
                                  </Col>
                                </Row>
                                <Row style={styles.formFieldPadding}>

                                  <Col style={styles.formIconLabelCol}>
                                    <View style={styles.formIconLabelView}>
                                      <Icon
                                        type="MaterialCommunityIcons"
                                        name="presentation"
                                        style={styles.formIcon}
                                      />
                                    </View>
                                  </Col>
                                  <Col>
                                    <Label
                                      style={styles.formLabel}
                                    >
                                      {i18n.t('contactDetailScreen.coaching')}
                                    </Label>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col style={styles.formIconLabelCol}>
                                    <View style={styles.formIconLabelView}>
                                      <Icon
                                        type="FontAwesome"
                                        name="user-circle"
                                        style={[styles.formIcon, { opacity: 0 }]}
                                      />
                                    </View>
                                  </Col>
                                  <Col>
                                    <Selectize
                                      ref={(selectize) => { coachingSelectizeRef = selectize; }}
                                      itemId="value"
                                      items={this.state.usersContacts}
                                      selectedItems={this.state.contact.coaching.values}
                                      textInputProps={{
                                        placeholder: i18n.t('contactDetailScreen.addCoaching'),
                                      }}
                                      renderRow={(id, onPress, item) => (
                                        <TouchableOpacity
                                          activeOpacity={0.6}
                                          key={id}
                                          onPress={onPress}
                                          style={{
                                            paddingVertical: 8,
                                            paddingHorizontal: 10,
                                          }}
                                        >
                                          <View style={{
                                            flexDirection: 'row',
                                          }}
                                          >
                                            <Text style={{
                                              color: 'rgba(0, 0, 0, 0.87)',
                                              fontSize: 14,
                                              lineHeight: 21,
                                            }}
                                            >
                                              {item.name}
                                            </Text>
                                            <Text style={{
                                              color: 'rgba(0, 0, 0, 0.54)',
                                              fontSize: 14,
                                              lineHeight: 21,
                                            }}
                                            >
                                              {' '}
                                              (#
                                              {id}
                                              )
                                            </Text>
                                          </View>
                                        </TouchableOpacity>
                                      )}
                                      renderChip={(id, onClose, item, style, iconStyle) => (
                                        <Chip
                                          key={id}
                                          iconStyle={iconStyle}
                                          onClose={onClose}
                                          text={item.name}
                                          style={style}
                                        />
                                      )}
                                      filterOnKey="name"
                                      keyboardShouldPersistTaps
                                      inputContainerStyle={{ borderWidth: 1, borderColor: '#CCCCCC', padding: 5 }}
                                    />
                                  </Col>
                                </Row>
                              </View>
                            )}
                          </ScrollView>
                        </Content>
                        <Footer>
                          <FooterTab>
                            <Button
                              onPress={() => this.onDisableEdit()}
                              style={{
                                height: 60, width: '50%', backgroundColor: '#FFFFFF',
                              }}
                            >
                              <Text style={{ color: Colors.tintColor, fontWeight: 'bold' }}>{i18n.t('global.cancel')}</Text>
                            </Button>
                            <Button
                              style={{
                                height: 60, width: '50%', backgroundColor: Colors.tintColor,
                              }}
                              onPress={this.onSaveContact}
                            >
                              <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>{i18n.t('global.save')}</Text>
                            </Button>
                          </FooterTab>
                        </Footer>
                      </Container>
                    )}
                  </KeyboardShift>
                )}
              </View>
            ) : (
              <KeyboardShift>
                {() => (
                  <ScrollView keyboardShouldPersistTaps="handled">
                    <View style={styles.formContainer}>
                      <Grid>
                        <Row>
                          <Label
                            style={[
                              styles.formLabel,
                              { marginTop: 10, marginBottom: 5 },
                            ]}
                          >
                            {i18n.t('contactDetailScreen.fullName')}
                          </Label>
                        </Row>
                        <Row>
                          <Input
                            placeholder={i18n.t('global.requiredField')}
                            onChangeText={this.setContactTitle}
                            style={{
                              borderColor: '#B4B4B4',
                              borderWidth: 1,
                              borderRadius: 5,
                              borderStyle: 'solid',
                              fontSize: 13,
                              paddingLeft: 15,
                            }}
                          />
                        </Row>
                        <Row>
                          <Label
                            style={[
                              styles.formLabel,
                              { marginTop: 10, marginBottom: 5 },
                            ]}
                          >
                            {i18n.t('contactDetailScreen.phoneNumber')}
                          </Label>
                        </Row>
                        <Row>
                          <Input
                            onChangeText={this.setSingleContactPhone}
                            style={{
                              borderColor: '#B4B4B4',
                              borderWidth: 1,
                              borderRadius: 5,
                              borderStyle: 'solid',
                              fontSize: 13,
                              paddingLeft: 15,
                            }}
                          />
                        </Row>
                        <Row>
                          <Label
                            style={[
                              styles.formLabel,
                              { marginTop: 10, marginBottom: 5 },
                            ]}
                          >
                            {i18n.t('contactDetailScreen.email')}
                          </Label>
                        </Row>
                        <Row>
                          <Input
                            onChangeText={this.setContactEmail}
                            style={{
                              borderColor: '#B4B4B4',
                              borderWidth: 1,
                              borderRadius: 5,
                              borderStyle: 'solid',
                              fontSize: 13,
                              paddingLeft: 15,
                            }}
                          />
                        </Row>
                        <Row>
                          <Label
                            style={[
                              styles.formLabel,
                              { marginTop: 10, marginBottom: 5 },
                            ]}
                          >
                            {i18n.t('contactDetailScreen.source')}
                          </Label>
                        </Row>
                        <Row>
                          <Picker
                            onValueChange={this.setContactSource}
                            selectedValue={
                              this.state.contact.sources.values[0].value
                            }
                          >
                            {this.renderSourcePickerItems()}
                          </Picker>
                        </Row>
                        <Row>
                          <Label
                            style={[
                              styles.formLabel,
                              { marginTop: 10, marginBottom: 5 },
                            ]}
                          >
                            {i18n.t('global.location')}
                          </Label>
                        </Row>
                        <Row>
                          <Col style={{ paddingLeft: 10, paddingRight: 10 }}>
                            <Selectize
                              ref={(selectize) => { geonamesSelectizeRef = selectize; }}
                              itemId="value"
                              items={this.state.geonames}
                              selectedItems={this.state.contact.geonames.values}
                              textInputProps={{
                                placeholder: i18n.t('contactDetailScreen.selectLocations'),
                              }}
                              renderRow={(id, onPress, item) => (
                                <TouchableOpacity
                                  activeOpacity={0.6}
                                  key={id}
                                  onPress={onPress}
                                  style={{
                                    paddingVertical: 8,
                                    paddingHorizontal: 10,
                                  }}
                                >
                                  <View
                                    style={{
                                      flexDirection: 'row',
                                    }}
                                  >
                                    <Text style={{
                                      color: 'rgba(0, 0, 0, 0.87)',
                                      fontSize: 14,
                                      lineHeight: 21,
                                    }}
                                    >
                                      {item.name}
                                    </Text>
                                  </View>
                                </TouchableOpacity>
                              )}
                              renderChip={(id, onClose, item, style, iconStyle) => (
                                <Chip
                                  key={id}
                                  iconStyle={iconStyle}
                                  onClose={onClose}
                                  text={item.name}
                                  style={style}
                                />
                              )}
                              filterOnKey="name"
                              keyboardShouldPersistTaps
                              inputContainerStyle={{ borderWidth: 1, borderColor: '#CCCCCC', padding: 5 }}
                            />
                          </Col>
                        </Row>
                        <Row>
                          <Label
                            style={[
                              styles.formLabel,
                              { marginTop: 10, marginBottom: 5 },
                            ]}
                          >
                            {i18n.t('contactDetailScreen.initialComment')}
                          </Label>
                        </Row>
                        <Row>
                          <Input
                            multiline
                            onChangeText={this.setContactInitialComment}
                            style={{
                              borderColor: '#B4B4B4',
                              borderWidth: 1,
                              borderRadius: 5,
                              borderStyle: 'solid',
                              fontSize: 13,
                              paddingLeft: 15,
                            }}
                          />
                        </Row>
                      </Grid>
                      <Button block style={styles.saveButton} onPress={this.onSaveContact}>
                        <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>{i18n.t('global.save')}</Text>
                      </Button>
                    </View>
                  </ScrollView>
                )}
              </KeyboardShift>
            )}
          </View>
        )}
        {successToast}
        {errorToast}
      </View>
    );
  }
}

ContactDetailScreen.propTypes = {
  userData: PropTypes.shape({
    domain: PropTypes.string,
    token: PropTypes.string,
  }).isRequired,
  contact: PropTypes.shape({
    ID: PropTypes.number,
    title: PropTypes.string,
    seeker_path: PropTypes.string,
  }),
  userReducerError: PropTypes.shape({
    code: PropTypes.string,
    message: PropTypes.string,
  }),
  newComment: PropTypes.shape({
    ID: PropTypes.string,
    author: PropTypes.string,
    content: PropTypes.string,
    date: PropTypes.string,
    gravatar: PropTypes.string,
  }),
  contactsReducerError: PropTypes.shape({
    code: PropTypes.string,
    message: PropTypes.string,
  }),
  navigation: PropTypes.shape({
    getParam: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
    setParams: PropTypes.func.isRequired,
  }).isRequired,
  saveContact: PropTypes.func.isRequired,
  getById: PropTypes.func.isRequired,
  getComments: PropTypes.func.isRequired,
  saveComment: PropTypes.func.isRequired,
  getActivities: PropTypes.func.isRequired,
  saved: PropTypes.bool,
};

ContactDetailScreen.defaultProps = {
  contact: null,
  userReducerError: null,
  newComment: null,
  contactsReducerError: null,
  saved: null,
};

const mapStateToProps = state => ({
  userData: state.userReducer.userData,
  userReducerError: state.userReducer.error,
  contact: state.contactsReducer.contact,
  comments: state.contactsReducer.comments,
  totalComments: state.contactsReducer.totalComments,
  loadingComments: state.contactsReducer.loadingComments,
  activities: state.contactsReducer.activities,
  totalActivities: state.contactsReducer.totalActivities,
  loadingActivities: state.contactsReducer.loadingActivities,
  newComment: state.contactsReducer.newComment,
  contactsReducerError: state.contactsReducer.error,
  loading: state.contactsReducer.loading,
  saved: state.contactsReducer.saved,
});

const mapDispatchToProps = dispatch => ({
  saveContact: (domain, token, contactDetail) => {
    dispatch(save(domain, token, contactDetail));
  },
  getById: (domain, token, contactId) => {
    dispatch(getById(domain, token, contactId));
  },
  getComments: (domain, token, contactId, offset, limit) => {
    dispatch(getCommentsByContact(domain, token, contactId, offset, limit));
  },
  saveComment: (domain, token, contactId, commentData) => {
    dispatch(saveComment(domain, token, contactId, commentData));
  },
  getActivities: (domain, token, contactId, offset, limit) => {
    dispatch(getActivitiesByContact(domain, token, contactId, offset, limit));
  },
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(ContactDetailScreen);