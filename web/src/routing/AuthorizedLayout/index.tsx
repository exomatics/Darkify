import React from 'react';
import { Layout, MainContent } from '../../styles/layout';
import { Header } from '../../components/Header';
import { Sidebar } from '../../components/Sidebar';
import { Playbar } from '../../components/Playbar';
import { FriendsActivity } from '../../components/FriendsActivity';

export const AuthorizedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Layout>
      <Header />
      <Sidebar />
      <MainContent>{children}</MainContent>
      <Playbar />
      <FriendsActivity />
    </Layout>
  );
};
