import { useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { useViewedProfile } from './ViewedProfileContext.jsx';
import { UserContext } from './UserContext.jsx';

const ViewedProfileRouteSync = () => {
  const { userId } = useParams();
  const { user: loggedUser } = useContext(UserContext);
  const { setByUserId } = useViewedProfile();

  useEffect(() => {
    const id = userId || loggedUser?.id;
    if (id) setByUserId(id);
  }, [userId, loggedUser?.id]); // eslint-disable-line

  return null;
};

export default ViewedProfileRouteSync;
